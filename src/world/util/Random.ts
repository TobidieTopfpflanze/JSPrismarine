const multiplier = 0x5deece66dn; // 25214903917n
const addend = 0xbn; // 11n
const mask = (1n << 48n) - 1n; // 281474976710655n

const INTEGER_SIZE = 32;
const BYTE_SIZE = 8;

// Hardcoded value because 0x1.0p-53 doesn't work in JavaScript.
// If it does let me know
// const DOUBLE_UNIT = 1.1102230246251565e-16; 1.0 / Number(1n << 53n)

/**
 * An almost-complete JavaScript implementation of java.util.Random.
 * What's currently missing are the streams, which are unimportant for this project.
 */
export default class Random {
    public seed!: bigint;
    #haveNextNextGaussian!: boolean;
    #nextNextGaussian!: number;

    constructor(
        seed: number | bigint = Random._seedUniquifier() ^
            process.hrtime.bigint()
    ) {
        this.setSeed(seed);
    }

    // private checkIsNumber(n: number | bigint) {
    //    if (typeof n != 'number' && typeof n != 'bigint') {
    //        throw new TypeError(`Seed "${n}" is not a number or BigInt!`);
    //    }
    // }

    static seedUniquifier = 8682522807148012n;

    static _seedUniquifier() {
        for (;;) {
            const current = this.seedUniquifier;
            const next = current * 181783497276652981n;
            if (this.seedUniquifier === current) {
                this.seedUniquifier = next;
                return next;
            }
        }
    }

    setSeed(seed: number | bigint) {
        this.seed = (BigInt(seed) ^ multiplier) & mask; // seed 44444 = 25214864369
        this.#haveNextNextGaussian = false;
    }

    next(bits: number): number {
        // seed 44444, next(32) returns these values in Java:
        /*
        808335106
        -2071974800
        1642053614
        1266353680
        -1031470248
        60610945
        693209954
        -1626706672
        -1343145554
        -82294530
        577267803
        -549943415
        -2056834905
        1150387176
        1152368095
        */

        const nextseed = (this.seed * multiplier + addend) & mask; // seed 44444 = 276226259555191
        this.seed = nextseed;
        return ~~Number(~~nextseed >> (48n - BigInt(bits)));
    }

    /**
     * Generates random bytes and places them into a user-supplied
     * byte array.  The number of random bytes produced is equal to
     * the length of the byte array.
     */
    nextBytes(bytes: number[]): void {
        for (let i = 0, len = bytes.length; i < len; ) {
            for (
                let rnd = this.nextInt(),
                    n = Math.min(len - i, INTEGER_SIZE / BYTE_SIZE);
                n-- > 0;
                rnd >>= BYTE_SIZE
            )
                bytes[i++] = rnd;
        }
    }

    /**
     * The form of nextLong used by LongStream Spliterators.  If
     * origin is greater than bound, acts as unbounded form of
     * nextLong, else as bounded form.
     */
    internalNextLong(origin: bigint, bound: bigint): bigint {
        let r = this.nextLong();
        if (origin < bound) {
            const n = bound - origin,
                m = n - 1n;

            if ((n & m) === 0n)
                // power of two
                r = (r & m) + origin;
            else if (n > 0n) {
                // reject over-represented candidates
                for (
                    // @ts-ignore
                    let u = r >>> 1n; // ensure nonnegative
                    u + m - (r = u % n) < 0n; // rejection check
                    // @ts-ignore
                    u = this.nextLong() >>> 1n
                ); // retry

                r += origin;
            } else {
                // range not representable as bigint
                while (r < origin || r >= bound) r = this.nextLong();
            }
        }

        return r;
    }

    /**
     * The form of nextInt used by IntStream Spliterators.
     * For the unbounded case: uses nextInt().
     * For the bounded case with representable range: uses nextInt(int bound)
     * For the bounded case with unrepresentable range: uses nextInt()
     */
    internalNextInt(origin: number, bound: number): number {
        if (origin < bound) {
            const n = bound - origin;
            if (n > 0) return this.nextInt(n) + origin;

            // range not representable as int
            let r;
            do {
                r = this.nextInt();
            } while (r < origin || r >= bound);

            return r;
        }

        return origin;
    }

    /**
     * The form of nextDouble used by DoubleStream Spliterators.
     */
    internalNextDouble(origin: number, bound: number): number {
        let r = this.nextDouble();
        if (origin < bound) {
            r = r * (bound - origin) + origin;
            if (r >= bound)
                // correct for rounding
                r = bound - 1;
        }

        return r;
    }

    /**
     * Returns the next pseudorandom, uniformly distributed int
     * value from this random number generator's sequence. The general
     * contract of nextInt is that one in value is
     * pseudorandomly generated and returned. All 2^(32) possible
     * int values are produced with (approximately) equal probability
     */
    nextInt(bound: number | undefined = undefined): number {
        if (!bound) return this.next(32);
        if (bound <= 0) throw new TypeError('NextInt: Bound is below 0!');

        let r = this.next(31);
        const m = bound - 1;

        if ((bound & m) === 0)
            // i.e., bound is a power of 2
            r = ~~Number(~~(BigInt(bound) * BigInt(r)) >> 31n);
        else {
            for (let u = r; u - (r = u % bound) + m < 0; u = this.next(31));
        }

        return ~~r;
    }

    /**
     * Returns the next pseudorandom, uniformly distributed long
     * value from this random number generator's sequence. The general
     * contract of nextLong is that one long value is
     * pseudorandomly generated and returned.
     *
     */
    nextLong(): bigint {
        /*
        // Generated from seed 44444 in Java

        3471772842406718576
        7052566571674961424
        -4430130981896398463
        2977314080064957712
        -5768766228280096514
        2479346334368827273
        */

        return ~~BigInt(
            ~~(BigInt(this.next(32)) << 32n) + BigInt(this.next(32))
        );
    }

    nextBoolean(): boolean {
        return this.next(1) !== 0;
    }

    nextFloat(): number {
        return this.next(24) / (1 << 24);
    }

    nextDouble(): number {
        return (
            (0x0000008000000 * this.next(26) + this.next(27)) / Math.pow(2, 53)
        );
    }

    nextGaussian(): number {
        if (this.#haveNextNextGaussian) {
            this.#haveNextNextGaussian = false;
            return this.#nextNextGaussian;
        }

        let v1, v2, s;
        do {
            v1 = 2 * this.nextDouble() - 1; // between -1 and 1
            v2 = 2 * this.nextDouble() - 1; // between -1 and 1
            s = v1 * v1 + v2 * v2;
        } while (s >= 1 || s === 0);

        const multiplier = Math.sqrt((-2 * Math.log(s)) / s);
        this.#nextNextGaussian = v2 * multiplier;
        this.#haveNextNextGaussian = true;

        return v1 * multiplier;
    }
}
