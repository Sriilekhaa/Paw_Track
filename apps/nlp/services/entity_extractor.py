import spacy
import re
from typing import List, Dict, Tuple, Set
from schemas.entities import ExtractedEntity, EntityExtractResponse

# Species-specific domain dictionary mapping patterns to categories, labels, and equipment
DOMAIN_PATTERNS = {
    "common": {
        "symptoms": [
            (r"\b(limp\w*|lame\w*)\b", "SYMPTOM", "Limping / Mobility Impairment"),
            (r"\b(bleed\w*|blood\w*|haemorrhag\w*)\b", "SYMPTOM", "Active Bleeding"),
            (r"\b(fractur\w*|broken bone|broken leg)\b", "SYMPTOM", "Bone Fracture"),
            (r"\b(maggot\w*|infested wound)\b", "SYMPTOM", "Maggot Infestation"),
            (r"\b(deep cut|open wound|laceration\w*)\b", "SYMPTOM", "Open Laceration"),
            (r"\b(unresponsive|unconscious|comatose|not moving)\b", "SYMPTOM", "Unresponsiveness / Shock"),
            (r"\b(shiver\w*|trembl\w*|hypothermi\w*)\b", "SYMPTOM", "Tremors / Hypothermia"),
            (r"\b(burn\w*|charred skin)\b", "SYMPTOM", "Burn Injury"),
        ],
        "landmarks": [
            (r"\b(north|south|east|west)?\s*(park|garden|nursery)\b", "LANDMARK", "Park Area"),
            (r"\b(metro station|railway station|bus stand|bus stop)\b", "LANDMARK", "Transit Hub"),
            (r"\b(expressway|highway|flyover|ring road|underpass|traffic junction|crossing)\b", "LANDMARK", "Highway / Road Junction"),
            (r"\b(market|bazaar|mall|commercial complex|shop\w*)\b", "LANDMARK", "Commercial Area"),
            (r"\b(school|college|university|temple|hospital)\b", "LANDMARK", "Public Landmark"),
            (r"\b(sector\s*\d+|block\s*[a-z0-9]+|street\s*\d+|lane\s*\d+|avenue\s*\d+)\b", "LOCATION", "Urban Sector / Block"),
        ],
    },
    "dog": {
        "symptoms": [
            (r"\b(foam\w* at (?:the )?mouth|excessive drool\w*|salivat\w*)\b", "SYMPTOM", "Rabies Risk: Mouth Foaming"),
            (r"\b(aggressive|snarl\w*|snapp\w*|biting|lung\w* at people)\b", "ANIMAL_BEHAVIOR", "Canine Aggression Hazard"),
            (r"\b(pack of dogs|pack fighting|strays chasing)\b", "ANIMAL_BEHAVIOR", "Pack Aggression"),
            (r"\b(puppy|puppies|litter|nursing mother)\b", "CONDITION", "Vulnerable Puppy Litter"),
            (r"\b(collar|red belt|chain|leash|harness)\b", "CONDITION", "Lost Pet: Collar Present"),
            (r"\b(mange|skin rash|hair loss|scabies)\b", "SYMPTOM", "Canine Sarcoptic Mange"),
        ],
        "equipment": ["Catch Pole", "Crate L", "Muzzle", "Bite Gloves"],
    },
    "cat": {
        "symptoms": [
            (r"\b(ear[- ]notch\w*|ear[- ]tip\w*)\b", "CONDITION", "Sterilized TNR Community Cat"),
            (r"\b(feral colony|clowder)\b", "CONDITION", "Feral Cat Colony"),
            (r"\b(trapped in car|engine|bonnet|drain pipe|stuck in tree|rooftop)\b", "CONDITION", "Feline Entrapment"),
            (r"\b(kitten\w*|nursing queen|crying kitten\w*)\b", "CONDITION", "Neonatal Kittens"),
            (r"\b(abscess|bite abscess|swollen jaw)\b", "SYMPTOM", "Feline Abscess"),
        ],
        "equipment": ["Cat Trap (Humane)", "Crate S", "Handling Towel", "Gauntlets"],
    },
    "cattle": {
        "symptoms": [
            (r"\b(bloat\w*|swollen stomach|rumen impaction|eating plastic)\b", "SYMPTOM", "Rumen Impaction / Plastic Bloat"),
            (r"\b(lying in (?:the )?road|blocking (?:[a-z]+ )?traffic|traffic block\w*|highway hazard|expressway divider)\b", "ANIMAL_BEHAVIOR", "Expressway Traffic Obstruction"),
            (r"\b(broken horn|horn fracture|horn bleed\w*)\b", "SYMPTOM", "Horn Trauma"),
            (r"\b(hoof wound|foot and mouth|limping cow|swollen hoof)\b", "SYMPTOM", "Hoof Infection / FMD Signs"),
            (r"\b(ear tag\s*\w*|yellow tag|dairy stamp)\b", "CONDITION", "Owned Cattle: Ear Tag Identified"),
        ],
        "equipment": ["Cattle Transport Hydraulic Crane", "Rope Halter", "Hoof Dressing Kit", "Traffic Warning Cones"],
    },
    "monkey": {
        "symptoms": [
            (r"\b(electrocute\w*|electric shock|wire burn|power line shock)\b", "SYMPTOM", "High-Voltage Electrocution Trauma"),
            (r"\b(terrace invasion|troop aggressive|snatching food|house entry)\b", "ANIMAL_BEHAVIOR", "Troop Urban Conflict"),
            (r"\b(infant clinging|baby monkey)\b", "CONDITION", "Infant Simian Present"),
        ],
        "equipment": ["Monkey Net Gun", "Reinforced Simian Cage", "Burn Dressing Kit", "Pole Snare"],
    },
    "bird": {
        "symptoms": [
            (r"\b(broken wing|drooping wing|unable to fly|fractured wing)\b", "SYMPTOM", "Avian Wing Fracture"),
            (r"\b(chinese manja|kite string|thread entangled|nylon thread)\b", "CONDITION", "Kite String (Manja) Entanglement"),
            (r"\b(heat stroke|grounded|fallen bird|dehydration)\b", "SYMPTOM", "Avian Heat Stroke / Grounded"),
            (r"\b(nest fallen|fledgling|chick)\b", "CONDITION", "Orphaned Nestling / Fledgling"),
        ],
        "equipment": ["Ventilated Avian Carrier", "Feather Scissors", "Antiseptic Spray", "Soft Blanket"],
    },
}


class EntityExtractor:
    def __init__(self):
        self._nlp = None
        self._initialized = False

    def _lazy_init(self):
        if self._initialized:
            return
        try:
            self._nlp = spacy.load("en_core_web_sm")
            self._initialized = True
        except Exception as e:
            print(f"⚠️ spaCy model load note: {e}. Falling back to rule-based regex extraction.")
            self._initialized = True

    def extract_entities(self, description: str, species: str = "dog") -> EntityExtractResponse:
        self._lazy_init()
        text_lower = description.lower()
        species_lower = species.lower() if species else "dog"

        extracted: List[ExtractedEntity] = []
        symptoms_set: Set[str] = set()
        locations_set: Set[str] = set()
        conditions_set: Set[str] = set()
        equipment_set: Set[str] = set()

        # Step 1: spaCy NER for Location & GPE extraction
        if self._nlp:
            try:
                doc = self._nlp(description)
                for ent in doc.ents:
                    if ent.label_ in ["GPE", "LOC", "FAC"]:
                        extracted.append(
                            ExtractedEntity(
                                text=ent.text,
                                label="LOCATION",
                                category="location",
                                confidence=0.92,
                                start_char=ent.start_char,
                                end_char=ent.end_char,
                            )
                        )
                        locations_set.add(ent.text)
            except Exception as err:
                print(f"spaCy NER error: {err}")

        # Step 2: Common Symptom and Landmark Rule Matching
        for pattern, label, norm_name in DOMAIN_PATTERNS["common"]["symptoms"]:
            for match in re.finditer(pattern, text_lower):
                matched_text = description[match.start():match.end()]
                extracted.append(
                    ExtractedEntity(
                        text=matched_text,
                        label=label,
                        category="symptom",
                        confidence=0.96,
                        start_char=match.start(),
                        end_char=match.end(),
                    )
                )
                symptoms_set.add(norm_name)

        for pattern, label, norm_name in DOMAIN_PATTERNS["common"]["landmarks"]:
            for match in re.finditer(pattern, text_lower):
                matched_text = description[match.start():match.end()]
                extracted.append(
                    ExtractedEntity(
                        text=matched_text,
                        label=label,
                        category="location",
                        confidence=0.90,
                        start_char=match.start(),
                        end_char=match.end(),
                    )
                )
                locations_set.add(norm_name)

        # Step 3: Species-Aware Domain Entity Matching
        species_rules = DOMAIN_PATTERNS.get(species_lower, DOMAIN_PATTERNS["dog"])
        for pattern, label, norm_name in species_rules.get("symptoms", []):
            for match in re.finditer(pattern, text_lower):
                matched_text = description[match.start():match.end()]
                cat = "symptom" if label == "SYMPTOM" else ("condition" if label == "CONDITION" else "behavior")
                extracted.append(
                    ExtractedEntity(
                        text=matched_text,
                        label=label,
                        category=cat,
                        confidence=0.97,
                        start_char=match.start(),
                        end_char=match.end(),
                    )
                )
                if cat == "symptom":
                    symptoms_set.add(norm_name)
                else:
                    conditions_set.add(norm_name)

        # Step 4: Species-Specific Equipment Recommendations
        base_equipment = list(species_rules.get("equipment", ["First-Aid Kit", "Standard Carrier"]))
        equipment_set.update(base_equipment)

        if "Bone Fracture" in symptoms_set or "Horn Trauma" in symptoms_set or "Active Bleeding" in symptoms_set:
            equipment_set.add("Emergency Splint & Bandage Kit")
        if "Rabies Risk: Mouth Foaming" in symptoms_set or "Canine Aggression Hazard" in conditions_set:
            equipment_set.add("Catch Pole & Safety Shield")

        return EntityExtractResponse(
            species=species_lower,
            entities=extracted,
            symptoms=sorted(list(symptoms_set)),
            locations=sorted(list(locations_set)),
            conditions=sorted(list(conditions_set)),
            equipment_recommended=sorted(list(equipment_set)),
        )


# Global singleton instance
entity_extractor_service = EntityExtractor()
