import argon2 from "argon2";
import crypto from "crypto";

export default async () => {
    const ARGON2 = {
        type: argon2.argon2id,
        memoryCost: 19456,
        timeCost: 2,
        parallelism: 1,
    };
    const otp = String(crypto.randomInt(100000, 999999));
    const otpHash = await argon2.hash(otp, ARGON2);
    return {otp, otpHash};
};