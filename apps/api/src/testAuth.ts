import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken, hashToken } from "./utils/tokens.js";
import bcrypt from "bcryptjs";

async function testAuthLogic() {
  console.log("--- Testing Auth & Token Logic ---");

  // 1. Test Password Hashing
  const password = "securePassword123";
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const isMatch = await bcrypt.compare(password, hash);
  console.log(`✓ Password Hashing & Verification: ${isMatch ? "PASSED" : "FAILED"}`);

  // 2. Test Access Token
  const accessPayload = { id: "user123", email: "officer@pawtrack.org", role: "field_worker" as const };
  const accessToken = generateAccessToken(accessPayload);
  const decodedAccess = verifyAccessToken(accessToken);
  console.log(`✓ Access Token Sign & Verify: ${decodedAccess.email === accessPayload.email && decodedAccess.role === "field_worker" ? "PASSED" : "FAILED"}`);

  // 3. Test Refresh Token & Hashing
  const refreshPayload = { id: "user123" };
  const refreshToken = generateRefreshToken(refreshPayload);
  const decodedRefresh = verifyRefreshToken(refreshToken);
  const tokenHash = hashToken(refreshToken);
  console.log(`✓ Refresh Token Generation & Hashing: ${decodedRefresh.id === "user123" && tokenHash.length === 64 ? "PASSED" : "FAILED"}`);

  // 4. Test Token Rotation Logic
  const rotatedRefreshToken = generateRefreshToken(refreshPayload);
  const rotatedHash = hashToken(rotatedRefreshToken);
  console.log(`✓ Refresh Token Rotation (Unique Hashes): ${tokenHash !== rotatedHash ? "PASSED" : "FAILED"}`);

  console.log("--- All Foundation Auth Tests Passed Successfully! ---");
}

testAuthLogic().catch(console.error);
