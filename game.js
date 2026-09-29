/**
 * Rishu Key Jutsu - Martial Arts Typing Combat
 * HTML5 Canvas 2D engine with procedural animations and Web Audio sound effects.
 * Author: Rishabh Yadav (rishu-builds)
 */

(function () {
    'use strict';

    // Audio engine & sound synthesizer
    class SoundEngine {
        constructor() {
            this.ctx = null;
            this.muted = false;
            this.hitBuffers = [];
            this.heavyBuffer = null;
            this.buffersLoaded = false;

            // Procedural Martial Arts BGM Synthesizer
            this.bgmPlaying = false;
            this.bgmTempo = 124; // 124 BPM martial arts groove
            this.bgmStep = 0;
            this.bgmInterval = null;
            this.noiseBuffer = null;
        }

        init() {
            if (!this.ctx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) {
                    this.ctx = new AudioContext();
                    this.createNoiseBuffer();
                }
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            if (this.ctx && !this.buffersLoaded) {
                this.loadHitBuffers();
            }
        }

        createNoiseBuffer() {
            if (!this.ctx || this.noiseBuffer) return;
            const bufferSize = this.ctx.sampleRate * 1; // 1 second of noise
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const output = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            this.noiseBuffer = buffer;
        }

        async loadHitBuffers() {
            if (!this.ctx || this.buffersLoaded) return;
            this.buffersLoaded = true;

            const decodeBase64 = async (b64Data) => {
                try {
                    const res = await fetch(b64Data);
                    const arrayBuf = await res.arrayBuffer();
                    return await this.ctx.decodeAudioData(arrayBuf);
                } catch (err) {
                    return null;
                }
            };

            if (window.REAL_HIT_SOUND_1) {
                const buf1 = await decodeBase64(window.REAL_HIT_SOUND_1);
                if (buf1) this.hitBuffers.push(buf1);
            }
            if (window.REAL_HIT_SOUND_2) {
                const buf2 = await decodeBase64(window.REAL_HIT_SOUND_2);
                if (buf2) this.hitBuffers.push(buf2);
            }
            if (window.REAL_HIT_HEAVY) {
                this.heavyBuffer = await decodeBase64(window.REAL_HIT_HEAVY);
            }
        }

        playHitSound(isHeavy = false) {
            if (this.muted) return;
            this.init();
            if (!this.ctx) return;

            let bufferToPlay = null;
            if (isHeavy && this.heavyBuffer) {
                bufferToPlay = this.heavyBuffer;
            } else if (this.hitBuffers.length > 0) {
                const idx = Math.floor(Math.random() * this.hitBuffers.length);
                bufferToPlay = this.hitBuffers[idx];
            } else if (this.heavyBuffer) {
                bufferToPlay = this.heavyBuffer;
            }

            if (bufferToPlay) {
                try {
                    const src = this.ctx.createBufferSource();
                    const gain = this.ctx.createGain();
                    src.playbackRate.value = 0.95 + Math.random() * 0.1;
                    src.buffer = bufferToPlay;
                    gain.gain.value = isHeavy ? 1.0 : 0.85;
                    src.connect(gain);
                    gain.connect(this.ctx.destination);
                    src.start(0);
                } catch (e) {
                    this.playStrike();
                }
            } else {
                if (isHeavy) this.playKick();
                else this.playStrike();
            }
        }

        playStrike() {
            if (this.muted || !this.ctx) return;
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(220, t);
            osc.frequency.exponentialRampToValueAtTime(45, t + 0.08);
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.09);
        }

        playKick() {
            if (this.muted || !this.ctx) return;
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(160, t);
            osc.frequency.exponentialRampToValueAtTime(30, t + 0.15);
            gain.gain.setValueAtTime(0.4, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.16);
        }

        playTypo() {
            if (this.muted || !this.ctx) return;
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(120, t);
            osc.frequency.linearRampToValueAtTime(60, t + 0.15);
            gain.gain.setValueAtTime(0.35, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.16);
        }

        playVictory() {
            if (this.muted || !this.ctx) return;
            const t = this.ctx.currentTime;
            const fanfare = [392, 523.25, 659.25, 783.99, 1046.5];
            fanfare.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const startTime = t + idx * 0.11;
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, startTime);
                gain.gain.setValueAtTime(0.3, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(startTime);
                osc.stop(startTime + 0.5);
            });
        }

        playDefeat() {
            if (this.muted || !this.ctx) return;
            const t = this.ctx.currentTime;
            const notes = [330, 293.66, 261.63, 196, 146.8];
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const startTime = t + idx * 0.16;
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, startTime);
                gain.gain.setValueAtTime(0.25, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(startTime);
                osc.stop(startTime + 0.45);
            });
        }

        playCombo(combo) {
            if (this.muted || !this.ctx) return;
            const t = this.ctx.currentTime;
            const baseFreq = 400 + Math.min(combo * 20, 650);
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(baseFreq, t);
            gain.gain.setValueAtTime(0.16, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.13);
        }

        // --- NEW MARTIAL ARTS SFX & CHAKRA AUDIO ---
        playJutsuReady() {
            if (this.muted || !this.ctx) return;
            const t = this.ctx.currentTime;
            const notes = [523.25, 659.25, 783.99, 1046.5];
            notes.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const st = t + i * 0.08;
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, st);
                gain.gain.setValueAtTime(0.25, st);
                gain.gain.exponentialRampToValueAtTime(0.001, st + 0.3);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(st);
                osc.stop(st + 0.35);
            });
        }

        playJutsuUnleashed() {
            if (this.muted || !this.ctx) return;
            const t = this.ctx.currentTime;
            // Massive sub bass drop
            const sub = this.ctx.createOscillator();
            const subGain = this.ctx.createGain();
            sub.type = 'sine';
            sub.frequency.setValueAtTime(120, t);
            sub.frequency.exponentialRampToValueAtTime(25, t + 0.4);
            subGain.gain.setValueAtTime(0.6, t);
            subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
            sub.connect(subGain);
            subGain.connect(this.ctx.destination);
            sub.start(t);
            sub.stop(t + 0.46);

            // Explosive noise blast
            if (this.noiseBuffer) {
                const noise = this.ctx.createBufferSource();
                noise.buffer = this.noiseBuffer;
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(1800, t);
                filter.frequency.exponentialRampToValueAtTime(200, t + 0.4);
                const nGain = this.ctx.createGain();
                nGain.gain.setValueAtTime(0.5, t);
                nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
                noise.connect(filter);
                filter.connect(nGain);
                nGain.connect(this.ctx.destination);
                noise.start(t);
                noise.stop(t + 0.42);
            }
        }

        playBossRoar() {
            if (this.muted || !this.ctx) return;
            const t = this.ctx.currentTime;
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc1.type = 'sawtooth';
            osc2.type = 'sawtooth';
            osc1.frequency.setValueAtTime(90, t);
            osc1.frequency.linearRampToValueAtTime(55, t + 0.6);
            osc2.frequency.setValueAtTime(95, t); // Dissonant minor 2nd
            osc2.frequency.linearRampToValueAtTime(58, t + 0.6);
            gain.gain.setValueAtTime(0.4, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(this.ctx.destination);
            osc1.start(t);
            osc2.start(t);
            osc1.stop(t + 0.7);
            osc2.stop(t + 0.7);
        }

        playLifeLost() {
            if (this.muted || !this.ctx) return;
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(140, t);
            osc.frequency.exponentialRampToValueAtTime(40, t + 0.25);
            gain.gain.setValueAtTime(0.4, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.26);
        }

        // --- PROCEDURAL MARTIAL ARTS BATTLE BGM ---
        startBGM() {
            if (this.bgmPlaying || this.muted) return;
            this.init();
            if (!this.ctx) return;

            this.bgmPlaying = true;
            this.bgmStep = 0;
            const intervalMs = (60 / this.bgmTempo / 4) * 1000; // 16th notes

            if (this.bgmInterval) clearInterval(this.bgmInterval);
            this.bgmInterval = setInterval(() => {
                this.tickBGMStep();
            }, intervalMs);

            const bgmBtn = document.getElementById('bgm-toggle-btn');
            if (bgmBtn) bgmBtn.classList.add('bgm-btn-active');
        }

        stopBGM() {
            this.bgmPlaying = false;
            if (this.bgmInterval) {
                clearInterval(this.bgmInterval);
                this.bgmInterval = null;
            }
            const bgmBtn = document.getElementById('bgm-toggle-btn');
            if (bgmBtn) bgmBtn.classList.remove('bgm-btn-active');
        }

        toggleBGM() {
            if (this.bgmPlaying) this.stopBGM();
            else this.startBGM();
        }

        setBGMTempo(tempo) {
            this.bgmTempo = tempo;
            if (this.bgmPlaying) {
                this.stopBGM();
                this.startBGM();
            }
        }

        tickBGMStep() {
            if (!this.bgmPlaying || this.muted || !this.ctx) return;
            const t = this.ctx.currentTime;
            const step = this.bgmStep % 16;
            this.bgmStep++;

            // 1. Taiko Kick (beats 0, 4, 8, 10, 12)
            if (step === 0 || step === 4 || step === 8 || step === 10 || step === 12) {
                const kick = this.ctx.createOscillator();
                const kGain = this.ctx.createGain();
                kick.type = 'sine';
                kick.frequency.setValueAtTime(140, t);
                kick.frequency.exponentialRampToValueAtTime(38, t + 0.1);
                kGain.gain.setValueAtTime(0.35, t);
                kGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
                kick.connect(kGain);
                kGain.connect(this.ctx.destination);
                kick.start(t);
                kick.stop(t + 0.11);
            }

            // 2. Karate Snare / Slap on beats 4, 12
            if (step === 4 || step === 12) {
                if (this.noiseBuffer) {
                    const sn = this.ctx.createBufferSource();
                    sn.buffer = this.noiseBuffer;
                    const filt = this.ctx.createBiquadFilter();
                    filt.type = 'bandpass';
                    filt.frequency.value = 1200;
                    const sGain = this.ctx.createGain();
                    sGain.gain.setValueAtTime(0.18, t);
                    sGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
                    sn.connect(filt);
                    filt.connect(sGain);
                    sGain.connect(this.ctx.destination);
                    sn.start(t);
                    sn.stop(t + 0.09);
                }
            }

            // 3. Shuriken Hi-Hat (Every 2 steps)
            if (step % 2 === 0) {
                if (this.noiseBuffer) {
                    const hh = this.ctx.createBufferSource();
                    hh.buffer = this.noiseBuffer;
                    const filt = this.ctx.createBiquadFilter();
                    filt.type = 'highpass';
                    filt.frequency.value = 7000;
                    const hGain = this.ctx.createGain();
                    hGain.gain.setValueAtTime(0.08, t);
                    hGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
                    hh.connect(filt);
                    filt.connect(hGain);
                    hGain.connect(this.ctx.destination);
                    hh.start(t);
                    hh.stop(t + 0.04);
                }
            }

            // 4. Martial Arts Bassline (Japanese Insen Scale: A, Bb, D, E, G)
            const bassNotes = [110, 0, 116.5, 0, 146.8, 0, 164.8, 146.8, 110, 0, 196.0, 0, 164.8, 146.8, 116.5, 0];
            const freq = bassNotes[step];
            if (freq > 0) {
                const bass = this.ctx.createOscillator();
                const bGain = this.ctx.createGain();
                bass.type = 'triangle';
                bass.frequency.setValueAtTime(freq, t);
                bGain.gain.setValueAtTime(0.14, t);
                bGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
                bass.connect(bGain);
                bGain.connect(this.ctx.destination);
                bass.start(t);
                bass.stop(t + 0.15);
            }
        }
    }

    const sound = new SoundEngine();

    // Arena curriculum & level configurations
    const ARENAS = [
        { id: 1, name: "Training Dojo", minLvl: 1, maxLvl: 10, bg: "assets/arena_01_training.png", wpmRange: "15–24 WPM", color: "#42E88A" },
        { id: 2, name: "Keyboard Circuit", minLvl: 11, maxLvl: 20, bg: "assets/arena_02_keyboard.png", wpmRange: "25–34 WPM", color: "#00D2FF" },
        { id: 3, name: "Neon Rooftop", minLvl: 21, maxLvl: 30, bg: "assets/arena_03_rooftop.png", wpmRange: "35–46 WPM", color: "#FF2A4B" },
        { id: 4, name: "Underground Facility", minLvl: 31, maxLvl: 40, bg: "assets/arena_04_underground.png", wpmRange: "47–59 WPM", color: "#FFB020" },
        { id: 5, name: "Emerald Samurai Meadow", minLvl: 41, maxLvl: 50, bg: "assets/arena_05_meadow.png", wpmRange: "60–72 WPM", color: "#2ECC71" },
        { id: 6, name: "Coastal Cliffside Fortress", minLvl: 51, maxLvl: 60, bg: "assets/arena_06_coastal.png", wpmRange: "73–87 WPM", color: "#3498DB" },
        { id: 7, name: "Industrial Cargo Harbor", minLvl: 61, maxLvl: 70, bg: "assets/arena_07_harbor.png", wpmRange: "88–101 WPM", color: "#E67E22" },
        { id: 8, name: "Bamboo Jungle Ruins", minLvl: 71, maxLvl: 80, bg: "assets/arena_08_jungle.png", wpmRange: "102–115 WPM", color: "#1ABC9C" },
        { id: 9, name: "Frozen Mountain Pass", minLvl: 81, maxLvl: 90, bg: "assets/arena_09_frozen.png", wpmRange: "116–131 WPM", color: "#00E5FF" },
        { id: 10, name: "Celestial Sky Realm", minLvl: 91, maxLvl: 99, bg: "assets/arena_10_sky.png", wpmRange: "132–146 WPM", color: "#9B59B6" },
        { id: 11, name: "Final Key Summit", minLvl: 100, maxLvl: 100, bg: "assets/arena_11_final_key.png", wpmRange: "148 WPM", color: "#FFD700" }
    ];

    const ARENA_WORD_POOLS = {
        "arena1": [
                "jab",
                "zen",
                "hit",
                "run",
                "aim",
                "bow",
                "war",
                "art",
                "cut",
                "sky",
                "fist",
                "kick",
                "flow",
                "step",
                "dojo",
                "wind",
                "fire",
                "iron",
                "dash",
                "leap",
                "fury",
                "grip",
                "palm",
                "soul",
                "mind",
                "lion",
                "hawk",
                "wolf",
                "fang",
                "claw",
                "peak",
                "calm",
                "drop",
                "rush",
                "spin",
                "rage",
                "edge",
                "hero",
                "bold",
                "fast",
                "dart",
                "glow",
                "jump",
                "keen",
                "lock",
                "moon",
                "rise",
                "roar",
                "sand",
                "slam",
                "snap",
                "stab",
                "trap",
                "true",
                "wave",
                "zeal",
                "apex",
                "bolt",
                "dare",
                "dawn",
                "echo",
                "flex",
                "gale",
                "hail",
                "helm",
                "pace",
                "raid",
                "spar",
                "veer",
                "wild",
                "beam",
                "core",
                "duel",
                "fate",
                "gong",
                "halo",
                "jolt",
                "knot",
                "lurk",
                "mark",
                "nest",
                "omen",
                "prow",
                "rank",
                "sage",
                "tide",
                "urge",
                "vibe",
                "wisp",
                "zone",
                "bark",
                "cast",
                "dirt",
                "etch",
                "fern",
                "gust",
                "harm",
                "isle",
                "judo",
                "kite",
                "lava",
                "mast",
                "nova",
                "oath",
                "path",
                "ruin",
                "soar",
                "turf",
                "veil",
                "wing",
                "yoke",
                "zoom",
                "blip",
                "clad",
                "dusk",
                "flux",
                "grit",
                "haze",
                "loot",
                "mesh",
                "node",
                "rift",
                "spur",
                "volt",
                "whip",
                "yell",
                "arch",
                "brim",
                "cord",
                "drum",
                "fume",
                "grid",
                "hulk",
                "jest",
                "limb",
                "mute",
                "plum",
                "quip",
                "ramp",
                "slit",
                "toil",
                "vale",
                "warp",
                "yard",
                "zest",
                "bind",
                "clap",
                "dive",
                "flap",
                "gasp",
                "halt",
                "knit",
                "lunge",
                "pant",
                "push",
                "slap",
                "tilt",
                "walk",
                "yank"
        ],
        "arena2": [
                "punch",
                "block",
                "focus",
                "speed",
                "ninja",
                "blade",
                "jutsu",
                "honor",
                "slash",
                "sweep",
                "guard",
                "power",
                "clash",
                "spark",
                "tiger",
                "viper",
                "cobra",
                "crane",
                "storm",
                "steel",
                "force",
                "swift",
                "brave",
                "valor",
                "smoke",
                "ghost",
                "shadow",
                "arrow",
                "spear",
                "shield",
                "tempo",
                "flame",
                "frost",
                "shock",
                "shred",
                "smash",
                "burst",
                "glide",
                "dodge",
                "parry",
                "thrust",
                "flash",
                "blaze",
                "chill",
                "combo",
                "feint",
                "flint",
                "forge",
                "haste",
                "hound",
                "impact",
                "knack",
                "latch",
                "might",
                "orbit",
                "poise",
                "quell",
                "razor",
                "reign",
                "scout",
                "sever",
                "shift",
                "snarl",
                "spike",
                "spire",
                "stalk",
                "surge",
                "thorn",
                "trace",
                "trail",
                "tread",
                "vault",
                "vigor",
                "wrath",
                "yield",
                "bound",
                "brawn",
                "chasm",
                "crest",
                "drill",
                "flank",
                "front",
                "gleam",
                "grasp",
                "havoc",
                "pulse",
                "reach",
                "rival",
                "scale",
                "shook",
                "cyber",
                "pixel",
                "laser",
                "macro",
                "logic",
                "input",
                "reset",
                "click",
                "enter",
                "space",
                "turbo",
                "glitch",
                "matrix",
                "signal",
                "neuron",
                "vector",
                "sensor",
                "binary",
                "device",
                "hacker",
                "packet",
                "socket",
                "plasma",
                "stream",
                "tensor",
                "syntax",
                "switch",
                "target",
                "output",
                "driver",
                "router",
                "buffer",
                "string",
                "module",
                "crypto",
                "access",
                "server",
                "client",
                "system",
                "bypass",
                "domain",
                "cipher",
                "memory",
                "portal",
                "daemon",
                "vertex",
                "sprite",
                "render",
                "kernel",
                "opcode",
                "beacon",
                "fluxor",
                "dynamo",
                "magnet",
                "optics",
                "uplink",
                "bridge",
                "subnet",
                "firewall",
                "prompt",
                "script",
                "thread",
                "widget",
                "canvas",
                "markup",
                "cursor",
                "inline"
        ],
        "arena3": [
                "combat",
                "master",
                "strike",
                "weapon",
                "attack",
                "dragon",
                "stance",
                "action",
                "charge",
                "energy",
                "spirit",
                "temple",
                "bamboo",
                "scroll",
                "katana",
                "kunai",
                "battle",
                "assault",
                "reflex",
                "counter",
                "defend",
                "chakra",
                "breeze",
                "stealth",
                "shuriken",
                "ronin",
                "samurai",
                "warfare",
                "tactics",
                "agility",
                "rhythm",
                "furious",
                "phantom",
                "vortex",
                "thunder",
                "dynamic",
                "prowess",
                "balance",
                "bravado",
                "cyclone",
                "defense",
                "destroy",
                "eclipse",
                "evasion",
                "fighter",
                "glacier",
                "instant",
                "justice",
                "knuckle",
                "legend",
                "martial",
                "nemesis",
                "outrage",
                "passage",
                "pursuit",
                "rampage",
                "rebound",
                "resolve",
                "revolve",
                "scimitar",
                "sentinel",
                "shinobi",
                "silence",
                "specter",
                "stamina",
                "striker",
                "tempest",
                "tornado",
                "triumph",
                "tsunami",
                "twister",
                "typhoon",
                "unleash",
                "vampire",
                "vanquish",
                "vengeance",
                "voltage",
                "warpath",
                "warriors",
                "acrobat",
                "avenger",
                "berserk",
                "brawler",
                "breaker",
                "bruiser",
                "carrier",
                "cascade",
                "charger",
                "circuit",
                "command",
                "conduit",
                "courier",
                "crusher",
                "drifter",
                "duelist",
                "emperor",
                "fallout",
                "fireball",
                "fissure",
                "fortress",
                "gambit",
                "gauntlet",
                "general",
                "grenade",
                "gunner",
                "harbinger",
                "hunter",
                "rooftop",
                "neonlit",
                "shadowy",
                "grapple",
                "skyline",
                "chimney",
                "catwalk",
                "skylight",
                "chimera",
                "zipline",
                "airdash",
                "prowler",
                "stalker",
                "dashing",
                "leaping",
                "sidestep",
                "backflip",
                "tumbler",
                "nightfall",
                "lantern",
                "moonlit",
                "wireline",
                "shadowstep",
                "skystride",
                "walljump",
                "highwire",
                "windwalk",
                "rooftops",
                "parapet",
                "crossway",
                "freerun",
                "ambusher",
                "infiltrate",
                "nightowl",
                "smokebomb",
                "flashbang",
                "blinding",
                "vanisher",
                "teleport",
                "aerial"
        ],
        "arena4": [
                "subterranean",
                "corridor",
                "pipeline",
                "pressure",
                "terminal",
                "override",
                "security",
                "generator",
                "hydraulic",
                "pneumatic",
                "protocol",
                "facility",
                "vaultgate",
                "lockdown",
                "shutdown",
                "breached",
                "intruder",
                "infrared",
                "detector",
                "sensory",
                "stealthy",
                "covertly",
                "sabotage",
                "underpass",
                "catacomb",
                "concourse",
                "reinforce",
                "bulkhead",
                "blastdoor",
                "elevator",
                "platform",
                "machinery",
                "mechanism",
                "synthetic",
                "cyborgian",
                "armature",
                "actuator",
                "conveyor",
                "magnetic",
                "inductor",
                "resonator",
                "frequency",
                "scrambler",
                "decryption",
                "firewall",
                "subroutine",
                "algorithm",
                "transistor",
                "capacitor",
                "transformer",
                "substation",
                "backbone",
                "deepwater",
                "conduit",
                "aqueduct",
                "underbelly",
                "trenchant",
                "deepfrost",
                "ironclads",
                "blackout",
                "overcharge",
                "discharge",
                "superheat",
                "overclock",
                "nanosuit",
                "titanium",
                "tungsten",
                "graphite",
                "graphene",
                "composite",
                "alloying",
                "weldmark",
                "heavygate",
                "barricade",
                "subversion",
                "clandestine",
                "blacksite",
                "containment",
                "biosensor",
                "perimeter",
                "reactor",
                "fissile",
                "meltdown",
                "turbines",
                "centrifuge",
                "cryogenic",
                "coolant",
                "radiation",
                "airshaft",
                "ventilation",
                "manhole",
                "ductwork",
                "maneuver",
                "tactician",
                "surveillance",
                "nightvision",
                "sonarwave",
                "depthgauge",
                "seismograph",
                "shockcord",
                "bunkerdoor",
                "strongbox",
                "titanmesh",
                "reinforcement",
                "blastshield",
                "scaffold",
                "interceptor",
                "countermeasure",
                "deflector",
                "highvoltage",
                "servocontrol",
                "cybernetic",
                "microchip",
                "mainframe",
                "datacenter",
                "underground",
                "excavation",
                "dynamite",
                "demolition",
                "jackhammer",
                "contain",
                "hazmat",
                "airlock",
                "circuit",
                "dynamo",
                "exhaust",
                "fission",
                "gearbox",
                "isolate",
                "junction",
                "keycard",
                "lithium",
                "network",
                "outpost",
                "passage",
                "quantum",
                "redline",
                "siphon",
                "thermal",
                "upgrade",
                "valves",
                "warhead",
                "cryopod",
                "driller",
                "emitter",
                "fuelrod",
                "grating",
                "hardhat",
                "igniter",
                "lockout",
                "nucleus",
                "overrun",
                "piston",
                "refinery",
                "silohead",
                "turret",
                "uranium",
                "voltage",
                "walkway"
        ],
        "arena5": [
                "discipline",
                "bushido",
                "swordsman",
                "bladecraft",
                "cleaving",
                "sharpened",
                "parrying",
                "countercut",
                "iaidojutsu",
                "kenjutsu",
                "sheathing",
                "drawsword",
                "sunburst",
                "windslash",
                "meadowland",
                "sakuratree",
                "petalfall",
                "whispering",
                "tranquility",
                "mindfulness",
                "focuspoint",
                "decisiveness",
                "fearlessness",
                "honorbound",
                "nobility",
                "chivalrous",
                "ancestral",
                "heritages",
                "generations",
                "legendary",
                "masterwork",
                "unyielding",
                "perseverant",
                "resilient",
                "enduring",
                "stainless",
                "edgecraft",
                "tempersteel",
                "forgemaster",
                "blacksmith",
                "anvilclang",
                "razorwind",
                "zephyrcut",
                "bambootree",
                "creekflow",
                "waterfall",
                "mountaintop",
                "sunriseglow",
                "afterglow",
                "stillwater",
                "deepforest",
                "clearing",
                "tranquil",
                "peaceful",
                "calmness",
                "innerpeace",
                "serenity",
                "spiritual",
                "awakening",
                "enlighten",
                "ascendant",
                "masterclass",
                "flawless",
                "perfection",
                "impeccable",
                "precision",
                "exactitude",
                "strikezone",
                "centerline",
                "vulnerable",
                "decapitate",
                "severance",
                "splitsecond",
                "harmonious",
                "symphonic",
                "choreography",
                "bladeclash",
                "sworddance",
                "moonshadow",
                "silentnight",
                "whitedragon",
                "jadeblade",
                "emeraldcut",
                "verdantleaf",
                "natureflow",
                "serenetouch",
                "gentlebreeze",
                "whistlingpine",
                "ancientway",
                "dojoking",
                "roninmaster",
                "samuraipath",
                "codeofhonor",
                "katanaedge",
                "wakizashi",
                "nodachi",
                "naginate",
                "tantoarrow",
                "shogunate",
                "daimyoway",
                "zenmeditation",
                "breathcontrol",
                "bodybalance",
                "footwork",
                "deflectblow",
                "counterthrust",
                "slashingstrike",
                "dragonbreath",
                "tigerfist",
                "cranewing",
                "bamboo",
                "katana",
                "master",
                "shadow",
                "samurai",
                "spirit",
                "shrine",
                "temple",
                "blossom",
                "courage",
                "destiny",
                "eternal",
                "fidelity",
                "harmony",
                "insight",
                "journey",
                "monarch",
                "purity",
                "ripples",
                "unbroken",
                "warrior",
                "zenith",
                "artisan",
                "bowstring",
                "devotion",
                "elegance",
                "fountain",
                "grandeur",
                "heirloom",
                "illusion",
                "judgement",
                "keenness",
                "lineage",
                "meditate",
                "reverence",
                "stillness",
                "timeless"
        ],
        "arena6": [
                "cliffside",
                "fortress",
                "citadel",
                "bastion",
                "stronghold",
                "ramparts",
                "barricades",
                "garrison",
                "sentinels",
                "watchtower",
                "lighthouse",
                "tempestuous",
                "hurricane",
                "cyclonic",
                "maelstrom",
                "whirlwind",
                "thunderous",
                "lightning",
                "downpour",
                "tidalwave",
                "breakers",
                "oceanic",
                "shoreline",
                "coastline",
                "headland",
                "promontory",
                "precipice",
                "abyssal",
                "depthless",
                "seastorm",
                "saltwater",
                "corrosion",
                "weathered",
                "endurance",
                "fortitude",
                "steadfast",
                "immovable",
                "monolithic",
                "cragsurfer",
                "wavecleaver",
                "stormchaser",
                "rainstorm",
                "cloudburst",
                "windstorm",
                "galespeed",
                "seabreeze",
                "crestfallen",
                "breakwater",
                "battlement",
                "parapets",
                "drawbridge",
                "portcullis",
                "ironbound",
                "stonework",
                "masonry",
                "foundations",
                "indomitable",
                "invincible",
                "impenetrable",
                "impervious",
                "resistance",
                "withstand",
                "outlasting",
                "weathering",
                "defending",
                "protecting",
                "safeguard",
                "wardenship",
                "guardianship",
                "champions",
                "defenders",
                "highfortress",
                "oceanguard",
                "seawallpass",
                "ironanchor",
                "stormtide",
                "roaringwave",
                "crashingtide",
                "seacliffway",
                "windbattered",
                "rockbound",
                "deepcavern",
                "coastalpath",
                "tidelocker",
                "aquaburst",
                "waterstrike",
                "riptideflow",
                "whirlpool",
                "oceantrench",
                "abyssaldrop",
                "thunderblast",
                "lightningrod",
                "squallfront",
                "fogshrouded",
                "mistcovered",
                "brinespray",
                "nauticalwar",
                "coastalshield",
                "beaconfire",
                "highbastion",
                "stonekeep",
                "watchwarden",
                "cliffguard",
                "ironchains",
                "catapultstone",
                "ballistaarm",
                "crenelation",
                "arrowslit",
                "defensetower",
                "moatbridge",
                "anchor",
                "beacon",
                "cliffs",
                "cyclone",
                "deluge",
                "horizon",
                "mariner",
                "monsoon",
                "nautical",
                "outflow",
                "ripcurl",
                "seawall",
                "tempest",
                "tsunami",
                "vortices",
                "cataract",
                "driftwood",
                "foghorns",
                "highseas",
                "islander",
                "keelhaul",
                "northeast",
                "offshore",
                "pierhead",
                "rainfall",
                "seaquake",
                "tidepool",
                "undertow",
                "waterway",
                "windward",
                "bulkhead",
                "deepblue",
                "ironclad",
                "maritime"
        ],
        "arena7": [
                "industrial",
                "cargoship",
                "docklands",
                "container",
                "shipyard",
                "freighter",
                "supercrane",
                "hydraulic",
                "pneumatics",
                "combustion",
                "generators",
                "locomotive",
                "warehouses",
                "foundries",
                "metalwork",
                "fabrication",
                "smelthouse",
                "blastfurnace",
                "crucibles",
                "conveyors",
                "smokestack",
                "machinists",
                "mechanisms",
                "turbomachinery",
                "compressor",
                "heavyweight",
                "ironclads",
                "dreadnought",
                "behemoths",
                "colossuses",
                "juggernauts",
                "titanforces",
                "horsepower",
                "steamroller",
                "wreckingball",
                "demolitions",
                "shattering",
                "pulverizing",
                "crushingforce",
                "hammerhead",
                "forgecraft",
                "steelplated",
                "reinforced",
                "cantilever",
                "counterweight",
                "pulleysystem",
                "ironchains",
                "anchorchain",
                "stevedores",
                "dockworkers",
                "supercharger",
                "intercooler",
                "transmission",
                "differential",
                "flywheels",
                "crankshaft",
                "driveshaft",
                "detonations",
                "shockabsorber",
                "stabilizer",
                "powerplants",
                "hydroelectric",
                "turbogenerator",
                "steelmillway",
                "heavyindustry",
                "blastgatepass",
                "scrapcrusher",
                "incinerator",
                "foundryworker",
                "craneoperator",
                "ironfurnace",
                "smeltingvat",
                "rollingmill",
                "boilerhouse",
                "steampressure",
                "gantrycrane",
                "containership",
                "bulkfreight",
                "drydockbay",
                "harborbasin",
                "quaysideway",
                "berthingdock",
                "ironoreyard",
                "coalbunkers",
                "machinetool",
                "latheworker",
                "weldingsparks",
                "rivetinggun",
                "pneumatichammer",
                "pressforge",
                "titanclaws",
                "powerhammer",
                "ironcastings",
                "billetsteel",
                "reinforcingbar",
                "structuralsteel",
                "cargocrane",
                "hoistingrig",
                "wirecables",
                "anchorwindlass",
                "anvil",
                "boiler",
                "cables",
                "derrick",
                "engine",
                "foundry",
                "gantry",
                "hoister",
                "ironworks",
                "jackline",
                "kinetic",
                "loading",
                "monolith",
                "overhaul",
                "pipeline",
                "quayside",
                "riveter",
                "shipping",
                "tonnage",
                "unloader",
                "viaduct",
                "winches",
                "crossbeam",
                "dockhand",
                "flywheel",
                "girder",
                "highline",
                "impeller",
                "jawcrush",
                "kilowatt",
                "longshore",
                "megawatt",
                "oilrig",
                "packload",
                "railway",
                "steamer",
                "tugboat",
                "unreeled",
                "warehousing",
                "yardwork"
        ],
        "arena8": [
                "subtropical",
                "wilderness",
                "bamboogrove",
                "ancientruins",
                "overgrown",
                "archeology",
                "mysterious",
                "hieroglyphs",
                "inscriptions",
                "camouflaged",
                "foliageway",
                "canopywalk",
                "tanglewood",
                "undergrowth",
                "predatory",
                "carnivorous",
                "instinctive",
                "primordial",
                "bloodhound",
                "nightstalker",
                "shadowhunter",
                "ambuscader",
                "entanglement",
                "stranglehold",
                "constrictor",
                "pantherclaws",
                "tigerspirit",
                "dragonsoul",
                "venomousbite",
                "paralyzing",
                "neurotoxin",
                "hallucinogen",
                "shamanistic",
                "incantation",
                "spiritwalker",
                "ancestorcall",
                "templeguard",
                "relickeeper",
                "sacredground",
                "stonegargoyle",
                "mossyhearth",
                "losttemple",
                "forgottenruins",
                "labyrinthine",
                "catacombs",
                "rootsystem",
                "stranglerfig",
                "quicksands",
                "deadlytraps",
                "tripwires",
                "blowgunner",
                "poisonshuriken",
                "dartthrower",
                "ferociousness",
                "untamableness",
                "wildbeasts",
                "bloodcurdling",
                "monolithicstatue",
                "ancientaltar",
                "sacrificialstone",
                "totempillar",
                "jungleshadow",
                "canopycover",
                "vinegrapple",
                "creeperroot",
                "swamplandway",
                "foggycanopy",
                "mossyskulls",
                "stonemonument",
                "runiccarvings",
                "tribalmask",
                "poisonneedle",
                "hiddenpitfall",
                "spikepitfall",
                "jungletempest",
                "tropicalrain",
                "monsoonwind",
                "wildcarnivore",
                "shadowpanther",
                "bambootrap",
                "shamanstaff",
                "voodoocurse",
                "spiritwhisper",
                "ancientrelic",
                "goldidolstatue",
                "chambershield",
                "tombguardian",
                "cursedjewel",
                "jungleprowler",
                "silentstepper",
                "canopy",
                "creeper",
                "fangtooth",
                "gorilla",
                "howler",
                "iguana",
                "jaguar",
                "leopard",
                "machete",
                "nestling",
                "overgrowth",
                "panther",
                "quicksand",
                "rainforest",
                "serpent",
                "tangling",
                "understory",
                "viperine",
                "wildwood",
                "zenana",
                "ancient",
                "bramble",
                "chasm",
                "deadfall",
                "everglade",
                "foliage",
                "greenery",
                "habitat",
                "insects",
                "jungle",
                "mangrove",
                "nocturnal",
                "outback",
                "predator",
                "rapids",
                "swampy",
                "thicket",
                "untamed",
                "vineyard",
                "woodland"
        ],
        "arena9": [
                "subzerochill",
                "frostbitten",
                "permafrost",
                "glaciation",
                "avalancheway",
                "blizzardous",
                "whiteoutstorm",
                "snowdrifting",
                "mountaineer",
                "crevassejump",
                "iceformations",
                "stalactites",
                "hailstorming",
                "temperatures",
                "hypothermia",
                "crystallized",
                "crystallizing",
                "diamondfrost",
                "absolutezero",
                "supercooling",
                "liquefaction",
                "condensation",
                "refrigeration",
                "sublimation",
                "transmutation",
                "sharpestshard",
                "icicleblade",
                "glaciermaster",
                "frostweaver",
                "winterstride",
                "frozenpass",
                "snowcapped",
                "altituderange",
                "rarefiedair",
                "oxygenstarve",
                "breathlessness",
                "heartstopper",
                "bloodfreezer",
                "unflinching",
                "ironwilled",
                "steelnerves",
                "impassiveness",
                "motionlessness",
                "perseverance",
                "tenaciousness",
                "hardihood",
                "fortitudinous",
                "endurancerun",
                "polarvortex",
                "arcticcircle",
                "tundraground",
                "packiceflow",
                "icebreaker",
                "frozentorrent",
                "icewallclimb",
                "crevasseplunge",
                "seracfalling",
                "glaciermoraine",
                "windsweptpeak",
                "howlingblizzard",
                "frostcarved",
                "zeroelevation",
                "summitassault",
                "ridgeclimber",
                "cornicefall",
                "freezinggale",
                "blizzardshield",
                "coldsurvival",
                "snowblindness",
                "thermalblanket",
                "glacierabyss",
                "frozentemple",
                "iceboundcavern",
                "shiveringwind",
                "frostbitemark",
                "glaciershearing",
                "icepacktraverse",
                "highaltitude",
                "peakconqueror",
                "mountainwarden",
                "glacialflow",
                "cryostasisfreeze",
                "chillinducing",
                "teethchattering",
                "icecrystalstorm",
                "freezingtorrent",
                "polarovercast",
                "northernlights",
                "auroraborealis",
                "frozenhorizon",
                "blizzard",
                "crevasse",
                "driftwood",
                "everfrost",
                "freezing",
                "glaciers",
                "hailstone",
                "icebound",
                "jackfrost",
                "moraine",
                "northwind",
                "outcropping",
                "polarbear",
                "rimefrost",
                "snowstorm",
                "timberline",
                "updraft",
                "ventifact",
                "whirlwind",
                "zerozone",
                "avalanche",
                "chillwind",
                "downslope",
                "frostbite",
                "glaciated",
                "hardpack",
                "icefields",
                "kametpass",
                "mountain",
                "packice",
                "ridgehead",
                "snowshoes",
                "tundras",
                "upglacier",
                "whiteout",
                "windchill",
                "alpine",
                "bivouac",
                "coldness",
                "frosting"
        ],
        "arena10": [
                "transcendence",
                "transcendental",
                "celestialbody",
                "stratosphere",
                "constellation",
                "astronomical",
                "supermassive",
                "gravitational",
                "spacetimefold",
                "eventhorizon",
                "singularity",
                "interplanetary",
                "interstellar",
                "omnipotence",
                "omnipresence",
                "omniscience",
                "supernatural",
                "divinespeed",
                "enlightenment",
                "illumination",
                "radianceglow",
                "phosphorescent",
                "luminescence",
                "effervescence",
                "electrodynamic",
                "electromagnet",
                "thermonuclear",
                "superconductivity",
                "semiconductor",
                "hypervelocity",
                "hyperdriveway",
                "speedoflight",
                "quantummechanics",
                "subatomicspeed",
                "entanglement",
                "wavefunctions",
                "superposition",
                "multidimensional",
                "cosmicvoyager",
                "starwanderer",
                "galacticstorm",
                "nebulaforge",
                "pulsarblasts",
                "supernovaburst",
                "whitehotcore",
                "immortalized",
                "incomparable",
                "unsurpassed",
                "unprecedented",
                "indomitable",
                "ethereallight",
                "celestialglory",
                "astralprojection",
                "divineascension",
                "starlightstream",
                "cosmicradiation",
                "plasmaprominence",
                "solareclipsing",
                "orbitalvelocity",
                "exoplanetary",
                "intergalactic",
                "cosmological",
                "heavensgateways",
                "throneofstars",
                "deitymanifest",
                "timelessbeing",
                "eternallight",
                "infinitevoid",
                "dimensionripper",
                "astralstrider",
                "spacewarpfield",
                "tachyonparticle",
                "darkmatterhalo",
                "cosmicstrings",
                "quasarradiance",
                "celestialblade",
                "godlikereflex",
                "zenithstriker",
                "omnipresentmind",
                "infinitechakra",
                "asteroid",
                "celestial",
                "darkmatter",
                "eclipse",
                "fireball",
                "galaxies",
                "hypernova",
                "ionosphere",
                "jupiter",
                "keplerian",
                "lightspeed",
                "meteorite",
                "nebulae",
                "orbiting",
                "planetary",
                "quasar",
                "radiation",
                "starlight",
                "telescope",
                "universe",
                "vacuum",
                "wormhole",
                "zenithal",
                "astronomy",
                "blackhole",
                "cosmonaut",
                "deepspace",
                "exosphere",
                "flarestar",
                "gravity",
                "heliosphere",
                "magnetar",
                "novaflare",
                "orbiter",
                "parallax",
                "redshift",
                "solarradius",
                "spacetime",
                "variable"
        ],
        "arena11": [
                "invulnerability",
                "unconquerability",
                "indestructibility",
                "incomparableness",
                "incomprehensibility",
                "counteroffensive",
                "disproportionate",
                "distinguishability",
                "electronegativity",
                "extraterrestrial",
                "hyperacceleration",
                "hyperdimensional",
                "incompatibility",
                "inconsequential",
                "indistinguishable",
                "instrumentalism",
                "interchangeable",
                "intercontinental",
                "interdependence",
                "internationalism",
                "kaleidoscopically",
                "microcontroller",
                "multidimensional",
                "nanotechnology",
                "omnidimensional",
                "parapsychology",
                "perpendicularity",
                "photosynthesis",
                "psychokinesis",
                "recapitalization",
                "responsiveness",
                "semiconductor",
                "spectrophotometer",
                "superconductivity",
                "telecommunication",
                "thermodynamics",
                "ultramicroscopic",
                "unaccountability",
                "uncompromisingly",
                "unquestionably",
                "unchallengeable",
                "uncontrollable",
                "imperviousness",
                "incombustibility",
                "transubstantiation",
                "overintellectual",
                "unconstitutional",
                "characteristically",
                "counterproductive",
                "disillusionment",
                "institutionalize",
                "misunderstanding",
                "straightforwardly",
                "unprepossessing",
                "counterbalancing",
                "interconnectedness",
                "superintellect",
                "grandmastery",
                "transcendentalism",
                "inextinguishable",
                "unassailability",
                "insurmountability",
                "counterrevolution",
                "hypertrophication",
                "incomprehensible",
                "indispensability",
                "indomitability",
                "unshakeableness",
                "legendarywarrior",
                "supremegrandmaster",
                "championshipbelt",
                "ultimateconqueror",
                "accomplishment",
                "breathlessness",
                "championship",
                "determination",
                "extraordinary",
                "fearlessness",
                "hypervelocity",
                "indomitable",
                "justification",
                "knighthood",
                "legendarywar",
                "masterfulness",
                "noblespirit",
                "overwhelming",
                "perseverance",
                "quintessence",
                "relentlessness",
                "steadfastness",
                "transcendence",
                "unbreakable",
                "victoriousness",
                "weightlessness",
                "zenithpower",
                "invincibility",
                "unmatchedskill",
                "dragonemperor",
                "ultimatemaster",
                "supremefighter"
        ]
};

    // Anti-repeat history buffer: Remembers last 80 words so words NEVER repeat in the same session
    const recentWordsHistory = [];
    const MAX_RECENT_WORDS = 80;

    function getWordsRequiredForLevel(level) {
        if (level === 100) return 20; // Final Grandmaster Boss
        if (level % 10 === 0) {
            // Boss levels (10, 20, 30 ... 90)
            const bossTier = Math.floor(level / 10);
            return 7 + Math.min(10, Math.floor(bossTier * 1.1)); // L10: 8, L20: 9, L30: 10, L40: 11, L50: 12, L60: 13, L70: 14, L80: 15, L90: 16
        }
        // Normal Progression
        if (level <= 3) return 4;
        if (level <= 7) return 5;
        if (level <= 15) return 6;
        if (level <= 25) return 7;
        if (level <= 35) return 8;
        if (level <= 45) return 9;
        if (level <= 55) return 10;
        if (level <= 65) return 11;
        if (level <= 75) return 12;
        if (level <= 85) return 13;
        if (level <= 95) return 14;
        return 15;
    }

    function getWordForLevel(level) {
        let poolKey;
        if (level <= 10) poolKey = 'arena1';
        else if (level <= 20) poolKey = 'arena2';
        else if (level <= 30) poolKey = 'arena3';
        else if (level <= 40) poolKey = 'arena4';
        else if (level <= 50) poolKey = 'arena5';
        else if (level <= 60) poolKey = 'arena6';
        else if (level <= 70) poolKey = 'arena7';
        else if (level <= 80) poolKey = 'arena8';
        else if (level <= 90) poolKey = 'arena9';
        else if (level <= 99) poolKey = 'arena10';
        else poolKey = 'arena11';

        const pool = ARENA_WORD_POOLS[poolKey] || ARENA_WORD_POOLS.arena1;
        // Filter out recently used words to prevent repetition
        const availableWords = pool.filter(w => !recentWordsHistory.includes(w.toLowerCase()));
        const candidatePool = (availableWords.length > 5) ? availableWords : pool;

        const selectedWord = candidatePool[Math.floor(Math.random() * candidatePool.length)];

        recentWordsHistory.push(selectedWord.toLowerCase());
        if (recentWordsHistory.length > MAX_RECENT_WORDS) {
            recentWordsHistory.shift();
        }

        return selectedWord;
    }

    // Belts, boss profiles, and combat rankings
    function getBeltInfo(unlockedLevel) {
        if (unlockedLevel >= 100) {
            return {
                name: "GOLDEN DRAGON MASTER",
                beltClass: "belt-dragon",
                color: "#FFD700",
                accent: "#FF8A00",
                title: "10TH DAN • GRAND EMPEROR",
                dan: "10th Dan"
            };
        } else if (unlockedLevel >= 71) {
            return {
                name: "BLACK BELT",
                beltClass: "belt-black",
                color: "#111726",
                accent: "#FFD700",
                title: "GRANDMASTER • 5TH DAN",
                dan: "5th Dan"
            };
        } else if (unlockedLevel >= 51) {
            return {
                name: "RED BELT",
                beltClass: "belt-red",
                color: "#EF4444",
                accent: "#FFFFFF",
                title: "SENIOR MASTER",
                dan: "3rd Dan"
            };
        } else if (unlockedLevel >= 36) {
            return {
                name: "BLUE BELT",
                beltClass: "belt-blue",
                color: "#0EA5E9",
                accent: "#FFFFFF",
                title: "WARRIOR SHINOBI",
                dan: "2nd Dan"
            };
        } else if (unlockedLevel >= 21) {
            return {
                name: "GREEN BELT",
                beltClass: "belt-green",
                color: "#22C55E",
                accent: "#FFFFFF",
                title: "ADEPT STRIKER",
                dan: "1st Dan"
            };
        } else if (unlockedLevel >= 11) {
            return {
                name: "YELLOW BELT",
                beltClass: "belt-yellow",
                color: "#FACC15",
                accent: "#713F12",
                title: "DISCIPLE",
                dan: "Kyu 3"
            };
        } else {
            return {
                name: "WHITE BELT",
                beltClass: "belt-white",
                color: "#E2E8F0",
                accent: "#0F172A",
                title: "INITIATE",
                dan: "Kyu 1"
            };
        }
    }

    const BOSS_CONFIGS = {
        10: { name: "DOJO SENSEI KENJI 🥋", title: "THE SACRED DOJO MASTER", hp: 140, color: "#42E88A" },
        20: { name: "CYBER SHINOBI ZERO 🤖", title: "THE NEURAL CODE SLICER", hp: 160, color: "#00D2FF" },
        30: { name: "NEON ONI DEMON 👹", title: "THE ROOFTOP TERROR", hp: 180, color: "#FF2A4B" },
        40: { name: "UNDERGROUND MECHA TITAN ⚙️", title: "THE HEAVY STEEL GOLEM", hp: 200, color: "#FFB020" },
        50: { name: "EMERALD SAMURAI SHOGUN ⚔️", title: "THE JADE BLADE SAINT", hp: 220, color: "#2ECC71" },
        60: { name: "COASTAL TIDE PHANTOM 🌊", title: "THE CLIFFSIDE SHADOW", hp: 240, color: "#3498DB" },
        70: { name: "HARBOR IRON TYRANT ⚓", title: "THE INDUSTRIAL OVERLORD", hp: 260, color: "#E67E22" },
        80: { name: "ANCIENT JUNGLE TIGER 🐯", title: "THE BAMBOO BEAST", hp: 280, color: "#1ABC9C" },
        90: { name: "FROZEN GLACIER OVERLORD ❄️", title: "THE ICY COLOSSUS", hp: 300, color: "#00E5FF" },
        100: { name: "THE SUPREME DRAGON EMPEROR 🐉", title: "THE FINAL KEY GRANDMASTER", hp: 350, color: "#FFD700" }
    };

    const JUTSU_WORDS = [
        "DRAGON STRIKE", "SHADOW CLONE", "RAIKIRI STORM", "FIRE TORNADO", 
        "TITAN QUAKE", "KEY JUTSU BURST", "CELESTIAL FIST", "PHOENIX KICK",
        "LIGHTNING BLADE", "VORTEX ASSAULT"
    ];

    // Fighter canvas drawing & animation system
    function drawCapsule(ctx, x1, y1, x2, y2, r, fillStyle, strokeStyle, lineWidth = 0) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.hypot(dx, dy);
        if (dist < 0.001) return;
        const nx = -dy / dist * r;
        const ny = dx / dist * r;

        ctx.beginPath();
        ctx.arc(x1, y1, r, Math.atan2(-ny, -nx), Math.atan2(ny, nx));
        ctx.arc(x2, y2, r, Math.atan2(ny, nx), Math.atan2(-ny, -nx));
        ctx.closePath();
        if (fillStyle) {
            ctx.fillStyle = fillStyle;
            ctx.fill();
        }
        if (strokeStyle && lineWidth > 0) {
            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        }
    }

    function drawRoundedRect(ctx, x, y, w, h, r) {
        if (ctx.roundRect) {
            ctx.roundRect(x, y, w, h, r);
        } else {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.arcTo(x + w, y, x + w, y + h, r);
            ctx.arcTo(x + w, y + h, x, y + h, r);
            ctx.arcTo(x, y + h, x, y, r);
            ctx.arcTo(x, y, x + w, y, r);
            ctx.closePath();
        }
    }

    class StickmanFighter {
        constructor(isPlayer, x, y) {
            this.isPlayer = isPlayer;
            this.baseX = x;
            this.baseY = y;
            this.x = x;
            this.y = y;
            this.state = 'IDLE';
            this.animTimer = 0;
            this.animDuration = 0.25;
            this.color = isPlayer ? '#00E5FF' : '#FF2A4B';
            this.scale = isPlayer ? 1.05 : 1.05;

            // Combat & Customization Upgrades
            this.beltInfo = getBeltInfo(1);
            this.isBoss = false;
            this.isBerserk = false;
            this.archetype = 'STANDARD';
            this.ghosts = [];
            this.ghostTimer = 0;
            this.combo = 0;
        }

        setBelt(beltInfo) {
            this.beltInfo = beltInfo;
        }

        setArchetype(archetype, isBoss = false) {
            this.archetype = archetype;
            this.isBoss = isBoss;
            this.isBerserk = false;

            if (isBoss) {
                this.scale = 1.35;
                this.color = '#FF2A4B';
            } else if (archetype === 'SCOUT') {
                this.scale = 0.92;
                this.color = '#00E5FF';
            } else if (archetype === 'TANK') {
                this.scale = 1.25;
                this.color = '#E67E22';
            } else {
                this.scale = 1.05;
                this.color = '#FF2A4B';
            }
        }

        triggerAttack(type) {
            this.state = type;
            this.animTimer = 0;
            this.animDuration = (type === 'UPPERCUT' || type === 'KICK') ? 0.32 : 0.2;
        }

        triggerHurt() {
            this.state = 'HURT';
            this.animTimer = 0;
            this.animDuration = 0.25;
        }

        update(dt) {
            this.animTimer += dt;
            if (this.state !== 'IDLE' && this.state !== 'VICTORY' && this.state !== 'FALLEN') {
                if (this.animTimer >= this.animDuration) {
                    this.state = 'IDLE';
                    this.x = this.baseX;
                    this.y = this.baseY;
                }
            }

            // Ghost afterimages when combo >= 10
            this.ghostTimer += dt;
            if (this.ghostTimer >= 0.04) {
                this.ghostTimer = 0;
                if (this.isPlayer && this.combo >= 10 && this.state !== 'IDLE') {
                    this.ghosts.unshift({
                        x: this.x,
                        y: this.y,
                        state: this.state,
                        animTimer: this.animTimer,
                        animDuration: this.animDuration,
                        alpha: 0.55
                    });
                    if (this.ghosts.length > 3) this.ghosts.pop();
                } else {
                    if (this.ghosts.length > 0) this.ghosts.pop();
                }
            }

            for (let i = this.ghosts.length - 1; i >= 0; i--) {
                this.ghosts[i].alpha -= dt * 2.5;
                if (this.ghosts[i].alpha <= 0) this.ghosts.splice(i, 1);
            }
        }

        draw(ctx) {
            // Draw ghost afterimages
            if (this.isPlayer && this.ghosts.length > 0) {
                for (const g of this.ghosts) {
                    ctx.save();
                    ctx.globalAlpha = Math.max(0, g.alpha * 0.4);
                    this.drawFigure(ctx, g.x, g.y, g.state, g.animTimer, g.animDuration, this.combo >= 20 ? '#FFD700' : '#00D2FF');
                    ctx.restore();
                }
            }

            // Draw main fighter
            ctx.save();
            const mainColor = (this.state === 'HURT') ? '#FFFFFF' : (this.isPlayer ? (this.beltInfo.color || '#00E5FF') : this.color);
            this.drawFigure(ctx, this.x, this.y, this.state, this.animTimer, this.animDuration, mainColor);
            ctx.restore();

            // Draw Aura (Combo 20+ or Boss Berserk)
            if ((this.isPlayer && this.combo >= 20) || (!this.isPlayer && this.isBerserk)) {
                this.drawAura(ctx);
            }
        }

        drawAura(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            const auraColor = this.isPlayer ? 'rgba(255, 215, 0, 0.45)' : 'rgba(255, 42, 75, 0.55)';
            const auraGlow = this.isPlayer ? '#FF8A00' : '#FF0033';

            const time = Date.now() * 0.008;
            for (let i = 0; i < 7; i++) {
                const angle = time + (i * Math.PI / 3.5);
                const r = (this.isBoss ? 45 : 35) + Math.sin(angle * 2) * 10;
                const ax = Math.cos(angle) * r;
                const ay = -120 + Math.sin(angle) * 45;

                ctx.beginPath();
                ctx.arc(ax, ay, 8 + Math.sin(time + i) * 4, 0, Math.PI * 2);
                ctx.fillStyle = auraColor;
                ctx.shadowColor = auraGlow;
                ctx.shadowBlur = 18;
                ctx.fill();
            }
            ctx.restore();
        }

        drawFigure(ctx, x, y, state, animTimer, animDuration, strokeColor) {
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(this.isPlayer ? this.scale : -this.scale, this.scale);

            const time = Date.now() * 0.005;
            const bounce = (state === 'IDLE') ? Math.sin(time * 2.2) * 4.5 : 0;
            const breath = (state === 'IDLE') ? Math.cos(time * 2.2) * 2 : 0;

            // 1. Soft Floor Shadow
            ctx.beginPath();
            ctx.ellipse(0, 4, 46 * (this.isBoss ? 1.4 : 1.0), 14, 0, 0, Math.PI * 2);
            ctx.fillStyle = this.isBoss ? 'rgba(255, 0, 40, 0.35)' : 'rgba(0, 0, 0, 0.55)';
            ctx.fill();

            // Dynamic Palette
            const suitBase = this.isPlayer ? '#141A29' : (this.isBoss ? '#200A12' : (this.archetype === 'TANK' ? '#24140D' : '#1A0D12'));
            const suitHighlight = this.isPlayer ? '#222F47' : (this.isBoss ? '#4D1220' : (this.archetype === 'TANK' ? '#4A2818' : '#381620'));
            const trimColor = (state === 'HURT') ? '#FFFFFF' : (this.isPlayer ? (this.beltInfo.color || '#00E5FF') : (this.isBoss ? '#FFD700' : this.color));
            const eyeColor = this.isPlayer ? (this.combo >= 15 ? '#FFD700' : '#00FFFF') : (this.isBoss ? (this.isBerserk ? '#FF0033' : '#FFD700') : '#FF2A4B');

            // Key Coordinates
            const hipY = -92 + bounce;
            const waistY = hipY - 22;
            const chestY = -146 + bounce + breath;
            const headY = -185 + bounce + breath;

            let headX = 0;
            let torsoLean = 0;
            let leftHand = { x: -28, y: chestY + 12 };
            let rightHand = { x: 30, y: chestY + 6 };
            let leftKnee = { x: -24, y: hipY + 45 };
            let rightKnee = { x: 22, y: hipY + 45 };
            let leftFoot = { x: -30, y: 0 };
            let rightFoot = { x: 26, y: 0 };

            const progress = Math.min(animTimer / animDuration, 1.0);

            // Animation Offsets
            if (state === 'JAB') {
                const s = Math.sin(progress * Math.PI);
                rightHand = { x: 35 + s * 80, y: chestY - 12 };
                headX = s * 14;
                torsoLean = s * 14;
                rightKnee.x += s * 10;
            } else if (state === 'PUNCH') {
                const s = Math.sin(progress * Math.PI);
                rightHand = { x: 30 + s * 95, y: chestY };
                headX = s * 16;
                torsoLean = s * 16;
            } else if (state === 'KICK') {
                const s = Math.sin(progress * Math.PI);
                rightKnee = { x: 40 + s * 50, y: hipY + 10 - s * 30 };
                rightFoot = { x: 35 + s * 105, y: chestY + 5 - s * 55 };
                torsoLean = -s * 22;
                headX = -s * 15;
            } else if (state === 'UPPERCUT') {
                const s = Math.sin(progress * Math.PI);
                rightHand = { x: 35 + s * 35, y: headY - s * 65 };
                torsoLean = s * 10;
                headX = s * 8;
            } else if (state === 'HURT') {
                const s = Math.sin(progress * Math.PI) * 28;
                headX = -s;
                torsoLean = -s * 1.2;
                leftHand = { x: -45, y: chestY - 10 };
                rightHand = { x: -15, y: chestY - 25 };
            }

            // --- BOSS FLOWING CAPE ---
            if (this.isBoss) {
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(torsoLean - 18, chestY - 10);
                ctx.lineTo(torsoLean + 18, chestY - 10);
                const capeWave = Math.sin(time * 3) * 15;
                ctx.quadraticCurveTo(torsoLean + 45 + capeWave, hipY + 30, torsoLean + 52 + capeWave * 1.5, 5);
                ctx.lineTo(torsoLean - 40 + capeWave * 0.8, 5);
                ctx.closePath();
                ctx.fillStyle = this.isBerserk ? 'rgba(180, 10, 30, 0.88)' : 'rgba(38, 10, 20, 0.9)';
                ctx.fill();
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();
            }

            // --- SCOUT DUAL BACK BLADES ---
            if (this.archetype === 'SCOUT') {
                ctx.save();
                ctx.strokeStyle = '#00E5FF';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(torsoLean - 10, chestY + 15);
                ctx.lineTo(torsoLean - 24, chestY - 35);
                ctx.moveTo(torsoLean + 10, chestY + 15);
                ctx.lineTo(torsoLean + 24, chestY - 35);
                ctx.stroke();
                ctx.restore();
            }

            // --- 2. BACK ARM (Left Arm) ---
            const armR = this.archetype === 'TANK' ? 9.5 : (this.isBoss ? 8.5 : 7);
            drawCapsule(ctx, torsoLean - 12, chestY, leftHand.x, leftHand.y - 12, armR, suitBase, suitHighlight, 1.5);
            drawCapsule(ctx, leftHand.x, leftHand.y - 12, leftHand.x, leftHand.y, armR - 0.5, '#E2E8F0', '#94A3B8', 1); // Wrist wrap
            // Fist
            ctx.beginPath();
            ctx.arc(leftHand.x, leftHand.y, armR + 1, 0, Math.PI * 2);
            ctx.fillStyle = suitBase;
            ctx.fill();
            ctx.strokeStyle = trimColor;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // --- 3. LEGS (Hakama Pants & Shin Guards) ---
            const legR = this.archetype === 'TANK' ? 13 : (this.isBoss ? 12 : 10.5);
            // Left Leg (Back leg)
            drawCapsule(ctx, -12, hipY, leftKnee.x, leftKnee.y, legR, suitBase, suitHighlight, 1.5);
            drawCapsule(ctx, leftKnee.x, leftKnee.y, leftFoot.x, leftFoot.y - 6, legR - 2, '#E2E8F0', '#64748B', 1.5);
            // Left Tabi Boot
            ctx.beginPath();
            drawRoundedRect(ctx, leftFoot.x - 11, leftFoot.y - 8, 23, 10, 4);
            ctx.fillStyle = suitBase;
            ctx.fill();
            ctx.strokeStyle = trimColor;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Right Leg (Front leg)
            drawCapsule(ctx, 12, hipY, rightKnee.x, rightKnee.y, legR + 0.5, suitHighlight, suitBase, 1.5);
            drawCapsule(ctx, rightKnee.x, rightKnee.y, rightFoot.x, rightFoot.y - 6, legR - 1.5, '#FFFFFF', '#94A3B8', 1.5);
            // Right Tabi Boot
            ctx.beginPath();
            drawRoundedRect(ctx, rightFoot.x - 11, rightFoot.y - 8, 25, 10, 4);
            ctx.fillStyle = suitBase;
            ctx.fill();
            ctx.strokeStyle = trimColor;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Kicking Energy Slash Crescent
            if (state === 'KICK') {
                ctx.save();
                ctx.beginPath();
                ctx.arc(rightFoot.x - 15, rightFoot.y, 35, -Math.PI * 0.4, Math.PI * 0.4);
                ctx.strokeStyle = trimColor;
                ctx.lineWidth = 4;
                ctx.shadowColor = trimColor;
                ctx.shadowBlur = 15;
                ctx.stroke();
                ctx.restore();
            }

            // --- 4. TORSO (Athletic Martial Arts Gi Tunic) ---
            ctx.save();
            ctx.beginPath();
            const shoulderW = this.archetype === 'TANK' ? 30 : (this.isBoss ? 28 : 24);
            const waistW = this.archetype === 'TANK' ? 18 : 14;
            ctx.moveTo(torsoLean - shoulderW, chestY);
            ctx.lineTo(torsoLean + shoulderW, chestY);
            ctx.lineTo(torsoLean + waistW, hipY);
            ctx.lineTo(torsoLean - waistW, hipY);
            ctx.closePath();

            const torsoGrad = ctx.createLinearGradient(torsoLean - shoulderW, chestY, torsoLean + shoulderW, hipY);
            torsoGrad.addColorStop(0, suitHighlight);
            torsoGrad.addColorStop(1, suitBase);
            ctx.fillStyle = torsoGrad;
            ctx.fill();
            ctx.strokeStyle = trimColor;
            ctx.lineWidth = 2;
            ctx.stroke();

            // V-Neck Gi Lapel Fold (Crossing)
            ctx.beginPath();
            ctx.moveTo(torsoLean - (shoulderW - 8), chestY);
            ctx.lineTo(torsoLean + 4, waistY + 6);
            ctx.strokeStyle = this.isPlayer ? '#FFFFFF' : '#FF8A00';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(torsoLean + (shoulderW - 8), chestY);
            ctx.lineTo(torsoLean - 6, waistY + 6);
            ctx.strokeStyle = this.isPlayer ? '#FFFFFF' : '#FF8A00';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Shoulder Pauldrons / Muscle Pads
            ctx.beginPath();
            ctx.arc(torsoLean - (shoulderW - 2), chestY + 2, this.archetype === 'TANK' ? 12 : 8.5, 0, Math.PI * 2);
            ctx.arc(torsoLean + (shoulderW - 2), chestY + 2, this.archetype === 'TANK' ? 12 : 8.5, 0, Math.PI * 2);
            ctx.fillStyle = (this.isBoss || this.archetype === 'TANK') ? '#FFD700' : suitHighlight;
            ctx.fill();
            ctx.strokeStyle = trimColor;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();

            // --- 5. MARTIAL ARTS OBI BELT & FLOWING TAILS ---
            ctx.save();
            const beltCol = this.isPlayer ? (this.beltInfo.color || '#FFFFFF') : (this.isBoss ? '#FFD700' : '#FF2A4B');
            ctx.fillStyle = beltCol;
            ctx.fillRect(torsoLean - 16, hipY - 6, 32, 10);
            ctx.strokeStyle = this.isPlayer ? (beltCol === '#111726' ? '#FFD700' : '#0F172A') : '#000000';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(torsoLean - 16, hipY - 6, 32, 10);

            // Belt Knot
            ctx.beginPath();
            ctx.arc(torsoLean + 2, hipY - 1, 5, 0, Math.PI * 2);
            ctx.fillStyle = beltCol;
            ctx.fill();
            ctx.stroke();

            // Flowing Belt Ribbon Tails (Physics sway)
            const tailSway1 = Math.sin(time * 2.5) * 5;
            const tailSway2 = Math.cos(time * 2.5) * 6;
            ctx.beginPath();
            ctx.moveTo(torsoLean + 1, hipY);
            ctx.quadraticCurveTo(torsoLean + 6 + tailSway1, hipY + 14, torsoLean + 4 + tailSway1 * 1.5, hipY + 26);
            ctx.lineWidth = 3.5;
            ctx.strokeStyle = beltCol;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(torsoLean + 3, hipY);
            ctx.quadraticCurveTo(torsoLean + 12 + tailSway2, hipY + 16, torsoLean + 10 + tailSway2 * 1.5, hipY + 30);
            ctx.lineWidth = 3.5;
            ctx.strokeStyle = beltCol;
            ctx.stroke();
            ctx.restore();

            // --- 6. FRONT ARM (Right Arm - Striking / Guarding) ---
            drawCapsule(ctx, torsoLean + 16, chestY, rightHand.x, rightHand.y - 14, armR + 0.5, suitHighlight, suitBase, 1.5);
            drawCapsule(ctx, rightHand.x, rightHand.y - 14, rightHand.x, rightHand.y, armR, '#FFFFFF', '#94A3B8', 1.5);
            // Clenched Fist
            ctx.beginPath();
            ctx.arc(rightHand.x, rightHand.y, armR + 2, 0, Math.PI * 2);
            ctx.fillStyle = suitHighlight;
            ctx.fill();
            ctx.strokeStyle = trimColor;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Striking Impact Energy Ring
            if (state === 'JAB' || state === 'PUNCH' || state === 'UPPERCUT') {
                ctx.save();
                ctx.beginPath();
                ctx.arc(rightHand.x, rightHand.y, 18, 0, Math.PI * 2);
                ctx.strokeStyle = trimColor;
                ctx.lineWidth = 2.5;
                ctx.shadowColor = trimColor;
                ctx.shadowBlur = 14;
                ctx.stroke();
                ctx.restore();
            }

            // --- 7. HEAD, NINJA COWL & GLOWING EYES ---
            const hx = torsoLean + headX;
            const hy = headY;

            // Flowing Headband Ribbons trailing behind head in the wind!
            const ribbonWave1 = Math.sin(time * 3.5) * 8;
            const ribbonWave2 = Math.cos(time * 3.5) * 10;
            ctx.save();
            ctx.strokeStyle = trimColor;
            ctx.lineWidth = 3.5;
            ctx.lineCap = 'round';

            ctx.beginPath();
            ctx.moveTo(hx - 14, hy - 4);
            ctx.quadraticCurveTo(hx - 36, hy - 8 + ribbonWave1, hx - 60, hy - 4 + ribbonWave1 * 1.5);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(hx - 14, hy);
            ctx.quadraticCurveTo(hx - 38, hy + 4 + ribbonWave2, hx - 66, hy + 10 + ribbonWave2 * 1.5);
            ctx.stroke();
            ctx.restore();

            // Head Cowl (Contoured Mask Shape)
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(hx - 16, hy - 18);
            ctx.lineTo(hx + 16, hy - 18);
            ctx.quadraticCurveTo(hx + 20, hy, hx + 12, hy + 16);
            ctx.lineTo(hx, hy + 22); // Chin
            ctx.lineTo(hx - 12, hy + 16);
            ctx.quadraticCurveTo(hx - 20, hy, hx - 16, hy - 18);
            ctx.closePath();

            const headGrad = ctx.createLinearGradient(hx - 16, hy - 18, hx + 16, hy + 22);
            headGrad.addColorStop(0, suitHighlight);
            headGrad.addColorStop(1, suitBase);
            ctx.fillStyle = headGrad;
            ctx.fill();
            ctx.strokeStyle = trimColor;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Forehead Metal Plate (Hitai-ate)
            ctx.beginPath();
            drawRoundedRect(ctx, hx - 14, hy - 14, 28, 9, 3);
            ctx.fillStyle = '#E2E8F0';
            ctx.fill();
            ctx.strokeStyle = '#64748B';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Emblem Core on Forehead Plate
            ctx.beginPath();
            ctx.arc(hx, hy - 9.5, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = trimColor;
            ctx.fill();

            // Fierce Glowing Warrior Anime Eyes
            ctx.save();
            ctx.shadowColor = eyeColor;
            ctx.shadowBlur = 12;
            ctx.fillStyle = eyeColor;

            // Front Eye
            ctx.beginPath();
            ctx.moveTo(hx + 4, hy - 1);
            ctx.lineTo(hx + 14, hy - 4);
            ctx.lineTo(hx + 12, hy);
            ctx.closePath();
            ctx.fill();

            // Back Eye
            ctx.beginPath();
            ctx.moveTo(hx - 3, hy - 1);
            ctx.lineTo(hx - 11, hy - 4);
            ctx.lineTo(hx - 9, hy);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            // --- BOSS SAMURAI KABUTO CREST / HORNS ---
            if (this.isBoss) {
                ctx.save();
                ctx.fillStyle = this.isBerserk ? '#FF0033' : '#FFD700';
                ctx.shadowColor = ctx.fillStyle;
                ctx.shadowBlur = 14;

                // Left Horn
                ctx.beginPath();
                ctx.moveTo(hx - 10, hy - 16);
                ctx.quadraticCurveTo(hx - 24, hy - 34, hx - 32, hy - 48);
                ctx.quadraticCurveTo(hx - 18, hy - 30, hx - 4, hy - 20);
                ctx.closePath();
                ctx.fill();

                // Right Horn
                ctx.beginPath();
                ctx.moveTo(hx + 10, hy - 16);
                ctx.quadraticCurveTo(hx + 24, hy - 34, hx + 32, hy - 48);
                ctx.quadraticCurveTo(hx + 18, hy - 30, hx + 4, hy - 20);
                ctx.closePath();
                ctx.fill();

                // Center Dragon Crest
                ctx.beginPath();
                ctx.moveTo(hx, hy - 38);
                ctx.lineTo(hx + 7, hy - 20);
                ctx.lineTo(hx - 7, hy - 20);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }

            ctx.restore();
            ctx.restore();
        }
    }

    // Particle, shockwave, and hit effects
    class FXSystem {
        constructor() {
            this.particles = [];
            this.texts = [];
            this.rings = [];
        }

        spawnHitSparks(x, y, color = '#00D2FF') {
            for (let i = 0; i < 14; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 3 + Math.random() * 7;
                this.particles.push({
                    x, y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 0.35 + Math.random() * 0.25,
                    maxLife: 0.6,
                    size: 2.5 + Math.random() * 3.5,
                    color
                });
            }
        }

        spawnShockwave(x, y, color = '#FFD700') {
            this.rings.push({
                x, y,
                radius: 12,
                maxRadius: 130,
                alpha: 1.0,
                color
            });
        }

        spawnExplosion(x, y, count = 35, color = '#FFD700') {
            this.spawnShockwave(x, y, color);
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 4 + Math.random() * 11;
                this.particles.push({
                    x, y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 0.45 + Math.random() * 0.4,
                    maxLife: 0.85,
                    size: 3 + Math.random() * 5,
                    color: (i % 2 === 0) ? color : '#FFFFFF'
                });
            }
        }

        spawnFloatingText(text, x, y, color = '#FFD700') {
            this.texts.push({ text, x, y, vy: -2, alpha: 1.0, color });
        }

        update(dt) {
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.2;
                p.life -= dt;
                if (p.life <= 0) this.particles.splice(i, 1);
            }
            for (let i = this.texts.length - 1; i >= 0; i--) {
                const t = this.texts[i];
                t.y += t.vy;
                t.alpha -= dt * 1.2;
                if (t.alpha <= 0) this.texts.splice(i, 1);
            }
            for (let i = this.rings.length - 1; i >= 0; i--) {
                const r = this.rings[i];
                r.radius += (r.maxRadius - r.radius) * dt * 8;
                r.alpha -= dt * 2.2;
                if (r.alpha <= 0 || r.radius >= r.maxRadius - 2) this.rings.splice(i, 1);
            }
        }

        draw(ctx) {
            // Draw Shockwaves
            for (const r of this.rings) {
                ctx.save();
                ctx.globalAlpha = Math.max(0, r.alpha);
                ctx.strokeStyle = r.color;
                ctx.lineWidth = 4;
                ctx.shadowColor = r.color;
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }

            // Draw Particles
            for (const p of this.particles) {
                const a = Math.max(0, p.life / p.maxLife);
                ctx.save();
                ctx.globalAlpha = a;
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            // Draw Floating Text
            for (const t of this.texts) {
                ctx.save();
                ctx.globalAlpha = Math.max(0, t.alpha);
                ctx.fillStyle = t.color;
                ctx.font = 'bold 24px "Space Grotesk", sans-serif';
                ctx.textAlign = 'center';
                ctx.shadowColor = t.color;
                ctx.shadowBlur = 10;
                ctx.fillText(t.text, t.x, t.y);
                ctx.restore();
            }
        }
    }

    // Main game controller
    class RishuKeyJutsuGame {
        constructor() {
            this.canvas = document.getElementById('gameCanvas');
            this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
            this.fx = new FXSystem();

            this.activeScreen = 'screen-main-menu';
            this.combatMode = 'IDLE';
            this.gameMode = 'LEVEL'; // 'LEVEL', 'ENDLESS', 'WEAK_KEYS'
            this.currentLevel = 1;
            this.selectedLevel = 1;
            this.levelPage = 0;

            this.arena = ARENAS[0];
            this.bgImage = new Image();
            this.screenShake = 0;
            this.hitStopTimer = 0;

            // Fighters HP & Chakra
            this.playerHP = 100;
            this.maxPlayerHP = 100;
            this.enemyHP = 100;
            this.maxEnemyHP = 100;

            this.chakra = 0;
            this.isJutsuActive = false;

            // Boss Encounter System
            this.isBossFight = false;
            this.bossConfig = null;
            this.bossHP = 200;
            this.bossMaxHP = 200;
            this.bossPhase = 1;

            // Endless Survival System
            this.endlessWave = 1;
            this.endlessLives = 3;
            this.endlessKills = 0;

            // Weak Keys Practice
            this.targetedWeakKeys = [];

            this.activeWord = "";
            this.typedIndex = 0;
            this.combo = 0;
            this.maxCombo = 0;
            this.totalKeypresses = 0;
            this.correctKeypresses = 0;
            this.matchStartTime = 0;
            this.enemyAttackTimer = 0;
            this.enemyAttackInterval = 4.0;

            this.player = new StickmanFighter(true, 440, 560);
            this.enemy = new StickmanFighter(false, 820, 560);

            this.testActive = false;
            this.testTimer = 60;
            this.testInterval = null;
            this.testText = "Arouse accountability through swift warrior keystrokes to conquer the shadow clan";
            this.testIndex = 0;
            this.testCorrect = 0;
            this.testTotal = 0;

            this.saveData = this.loadSaveData();

            this.init();
        }

        loadSaveData() {
            const defaultSave = {
                version: 2,
                unlockedLevel: 1,
                stars: {},
                bestWpm: 0,
                avgWpm: 0,
                bestAcc: 0,
                avgAcc: 0,
                totalTests: 0,
                practiceTimeSeconds: 0,
                completedCount: 0,
                totalScore: 0,
                fighterName: "WARRIOR RISHU",
                survivalBestWave: 0,
                survivalHighScore: 0,
                keyStats: {}
            };
            const stored = localStorage.getItem('rishu_keyjutsu_save');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    // Reset legacy mock test data if found so users start fresh from Level 1
                    if (!parsed.version || (parsed.unlockedLevel === 7 && parsed.totalScore === 7431) || (parsed.completedCount === 6 && parsed.practiceTimeSeconds === 97)) {
                        localStorage.setItem('rishu_keyjutsu_save', JSON.stringify(defaultSave));
                        return defaultSave;
                    }
                    return Object.assign(defaultSave, parsed);
                } catch (e) { }
            }
            return defaultSave;
        }

        saveProgress() {
            localStorage.setItem('rishu_keyjutsu_save', JSON.stringify(this.saveData));
        }

        switchScreen(screenId) {
            document.querySelectorAll('.game-screen').forEach(scr => {
                scr.classList.remove('active');
                scr.style.display = 'none';
            });
            const target = document.getElementById(screenId);
            if (target) {
                target.classList.add('active');
                target.style.display = 'flex';
                this.activeScreen = screenId;
            }

            if (screenId === 'screen-level-select') {
                this.renderLevelSelectPage();
            } else if (screenId === 'screen-stats-dashboard') {
                this.renderStatsDashboard();
            } else if (screenId === 'screen-typing-test') {
                this.startTypingTest();
            }
        }

        init() {
            this.bindMenuButtons();
            this.bindLevelSelect();
            this.bindStatsDashboard();
            this.bindTypingTest();
            this.bindCombatHUD();
            this.bindCertificateModal();
            this.bindGlobalKeyboard();
            this.initGameLoop();

            this.switchScreen('screen-main-menu');
        }

        bindMenuButtons() {
            document.getElementById('menu-btn-play').addEventListener('click', () => {
                sound.init();
                this.startCombatLevel(this.saveData.unlockedLevel || 1);
            });
            document.getElementById('menu-btn-levels').addEventListener('click', () => {
                sound.init();
                this.switchScreen('screen-level-select');
            });
            document.getElementById('menu-btn-test').addEventListener('click', () => {
                sound.init();
                this.switchScreen('screen-typing-test');
            });
            document.getElementById('menu-btn-stats').addEventListener('click', () => {
                sound.init();
                this.switchScreen('screen-stats-dashboard');
            });
            document.getElementById('menu-btn-settings').addEventListener('click', () => {
                document.getElementById('settings-modal').style.display = 'flex';
            });
            document.getElementById('menu-btn-howto').addEventListener('click', () => {
                document.getElementById('howto-modal').style.display = 'flex';
            });
            document.getElementById('menu-btn-exit').addEventListener('click', () => {
                window.location.href = 'index.html';
            });

            // Quick launch badges
            const menuEndlessBtn = document.getElementById('menu-btn-endless');
            if (menuEndlessBtn) {
                menuEndlessBtn.addEventListener('click', () => {
                    sound.init();
                    this.startEndlessMode();
                });
            }
            const menuCertBtn = document.getElementById('menu-btn-cert');
            if (menuCertBtn) {
                menuCertBtn.addEventListener('click', () => {
                    this.openCertificateModal();
                });
            }

            document.getElementById('close-settings-btn').addEventListener('click', () => {
                document.getElementById('settings-modal').style.display = 'none';
            });
            document.getElementById('setting-sound-btn').addEventListener('click', (e) => {
                sound.muted = !sound.muted;
                e.target.textContent = sound.muted ? 'UNMUTE SOUND' : 'MUTE SOUND';
            });
            document.getElementById('setting-fs-btn').addEventListener('click', () => {
                if (!document.fullscreenElement) document.documentElement.requestFullscreen();
                else document.exitFullscreen();
            });
            document.getElementById('setting-reset-btn').addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all progress?')) {
                    localStorage.removeItem('rishu_keyjutsu_save');
                    this.saveData = this.loadSaveData();
                    this.saveData.unlockedLevel = 1;
                    this.saveData.stars = {};
                    this.saveProgress();
                    alert('Progress reset to Level 1.');
                    document.getElementById('settings-modal').style.display = 'none';
                }
            });

            document.getElementById('close-howto-btn').addEventListener('click', () => {
                document.getElementById('howto-modal').style.display = 'none';
            });
        }

        bindLevelSelect() {
            document.getElementById('lvl-back-btn').addEventListener('click', () => {
                this.switchScreen('screen-main-menu');
            });
            document.getElementById('lvl-prev-btn').addEventListener('click', () => {
                if (this.levelPage > 0) {
                    this.levelPage--;
                    this.renderLevelSelectPage();
                }
            });
            document.getElementById('lvl-next-btn').addEventListener('click', () => {
                if (this.levelPage < 9) {
                    this.levelPage++;
                    this.renderLevelSelectPage();
                }
            });
            document.getElementById('lvl-start-btn').addEventListener('click', () => {
                sound.init();
                this.startCombatLevel(this.selectedLevel);
            });
            const lvlEndlessBtn = document.getElementById('lvl-endless-btn');
            if (lvlEndlessBtn) {
                lvlEndlessBtn.addEventListener('click', () => {
                    sound.init();
                    this.startEndlessMode();
                });
            }
        }

        renderLevelSelectPage() {
            const grid = document.getElementById('ten-cards-grid');
            const prevBtn = document.getElementById('lvl-prev-btn');
            const nextBtn = document.getElementById('lvl-next-btn');
            const indicator = document.getElementById('lvl-page-indicator');

            if (!grid) return;
            grid.innerHTML = '';

            const startLvl = this.levelPage * 10 + 1;
            const endLvl = startLvl + 9;

            prevBtn.disabled = (this.levelPage === 0);
            nextBtn.disabled = (this.levelPage === 9);
            indicator.textContent = `LEVELS ${startLvl} - ${endLvl}`;

            for (let lvl = startLvl; lvl <= endLvl; lvl++) {
                const card = document.createElement('div');
                const isClear = lvl < this.saveData.unlockedLevel;
                const isUnlocked = lvl <= this.saveData.unlockedLevel;
                const isSelected = (lvl === this.selectedLevel);
                const isBoss = (lvl % 10 === 0);

                card.className = `ten-level-card ${isUnlocked ? '' : 'locked'} ${isSelected ? 'selected' : ''}`;

                let statusHtml = '';
                let targetWpm = 15 + Math.floor(lvl * 1.35);

                if (isBoss) {
                    const bossInfo = BOSS_CONFIGS[lvl] || { name: 'BOSS NINJA' };
                    if (isClear) {
                        statusHtml = `<div class="card-status-pill clear">✓ BOSS CLEARED</div>`;
                    } else if (isUnlocked) {
                        statusHtml = `<div class="card-status-pill unlocked" style="border-color: #FF2A4B; color: #FF2A4B;">🔥 BOSS FIGHT</div>`;
                    } else {
                        statusHtml = `<div class="card-status-pill locked">🔒 BOSS LOCKED</div>`;
                    }
                    card.innerHTML = `
                        ${statusHtml}
                        <div class="card-lvl-number" style="color: #FF2A4B;">${lvl}</div>
                        <div class="card-target-wpm">${targetWpm} WPM</div>
                        <div class="card-sub-tag" style="color: #FFD700; font-size: 0.65rem;">${bossInfo.name}</div>
                    `;
                } else if (isClear) {
                    const stars = this.saveData.stars[lvl] || 3;
                    const starsStr = '★'.repeat(stars) + '☆'.repeat(3 - stars);
                    statusHtml = `<div class="card-status-pill clear">✓ CLEAR</div>`;
                    card.innerHTML = `
                        ${statusHtml}
                        <div class="card-lvl-number">${lvl}</div>
                        <div class="card-target-wpm">${targetWpm} WPM</div>
                        <div class="card-stars-line">${starsStr}</div>
                    `;
                } else if (isUnlocked) {
                    statusHtml = `<div class="card-status-pill unlocked">🔓 UNLOCKED</div>`;
                    card.innerHTML = `
                        ${statusHtml}
                        <div class="card-lvl-number">${lvl}</div>
                        <div class="card-target-wpm">${targetWpm} WPM</div>
                        <div class="card-sub-tag">SKILL UNLOCKED</div>
                    `;
                } else {
                    statusHtml = `<div class="card-status-pill locked">🔒 LOCKED</div>`;
                    card.innerHTML = `
                        ${statusHtml}
                        <div class="card-lvl-number">${lvl}</div>
                        <div class="card-target-wpm">${targetWpm} WPM</div>
                        <div class="card-sub-tag" style="color: #6C7A8E;">REQ: ${targetWpm}WPM</div>
                    `;
                }

                if (isUnlocked) {
                    card.addEventListener('click', () => {
                        this.selectedLevel = lvl;
                        document.querySelectorAll('.ten-level-card').forEach(c => c.classList.remove('selected'));
                        card.classList.add('selected');
                        sound.playHitSound(false);
                    });
                }

                grid.appendChild(card);
            }
        }

        bindStatsDashboard() {
            document.getElementById('stats-back-btn').addEventListener('click', () => {
                this.switchScreen('screen-main-menu');
            });
            document.getElementById('practice-weak-btn').addEventListener('click', () => {
                sound.init();
                this.startWeakKeysDrill();
            });
            const statsCertBtn = document.getElementById('stats-cert-btn');
            if (statsCertBtn) {
                statsCertBtn.addEventListener('click', () => {
                    this.openCertificateModal();
                });
            }
        }

        renderStatsDashboard() {
            document.getElementById('dash-best-wpm').textContent = `${this.saveData.bestWpm} WPM`;
            document.getElementById('dash-avg-wpm').textContent = `${this.saveData.avgWpm} WPM`;
            document.getElementById('dash-best-acc').textContent = `${this.saveData.bestAcc}%`;
            document.getElementById('dash-avg-acc').textContent = `${this.saveData.avgAcc}%`;
            document.getElementById('dash-total-tests').textContent = this.saveData.totalTests;

            const mins = Math.floor(this.saveData.practiceTimeSeconds / 60);
            const secs = this.saveData.practiceTimeSeconds % 60;
            document.getElementById('dash-practice-time').textContent = `${mins}m ${secs}s`;

            document.getElementById('dash-completed-count').textContent = this.saveData.completedCount;
            document.getElementById('dash-unlocked-count').textContent = `${this.saveData.unlockedLevel} / 100`;
            document.getElementById('dash-total-score').textContent = this.saveData.totalScore;

            const kbContainer = document.getElementById('heatmap-keyboard');
            kbContainer.innerHTML = '';

            const rows = [
                ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
                ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
                ['z', 'x', 'c', 'v', 'b', 'n', 'm']
            ];

            const tooltip = document.getElementById('heatmap-key-tooltip');

            rows.forEach(rowKeys => {
                const rowEl = document.createElement('div');
                rowEl.className = 'hm-row';

                rowKeys.forEach(k => {
                    const keyEl = document.createElement('div');
                    keyEl.className = 'hm-key';
                    keyEl.textContent = k.toUpperCase();

                    const stats = this.saveData.keyStats[k] || { correct: 0, errors: 0 };
                    const total = stats.correct + stats.errors;
                    let tier = 'nodata';
                    let accPercent = 100;

                    if (total > 0) {
                        accPercent = Math.round((stats.correct / total) * 100);
                        if (accPercent < 80) tier = 'weak';
                        else if (accPercent < 90) tier = 'developing';
                        else tier = 'strong';
                    }

                    if (tier !== 'nodata') keyEl.classList.add(tier);

                    keyEl.addEventListener('mouseenter', () => {
                        tooltip.textContent = `KEY [${k.toUpperCase()}]: ${total > 0 ? accPercent + '% Accuracy' : 'No Data'} • ${stats.correct} Correct • ${stats.errors} Errors`;
                    });
                    keyEl.addEventListener('click', () => {
                        sound.playHitSound(false);
                        tooltip.textContent = `KEY [${k.toUpperCase()}]: ${total > 0 ? accPercent + '% Accuracy' : 'No Data'} • ${stats.correct} Correct • ${stats.errors} Errors`;
                    });

                    rowEl.appendChild(keyEl);
                });

                kbContainer.appendChild(rowEl);
            });

            const weakRow = document.getElementById('weak-keys-badges');
            weakRow.innerHTML = '';
            const weakEntries = Object.entries(this.saveData.keyStats)
                .filter(([k, s]) => (s.correct + s.errors) > 0 && (s.correct / (s.correct + s.errors)) < 0.85)
                .sort((a, b) => (a[1].correct / (a[1].correct + a[1].errors)) - (b[1].correct / (b[1].correct + b[1].errors)));

            weakEntries.slice(0, 6).forEach(([k, s]) => {
                const acc = Math.round((s.correct / (s.correct + s.errors)) * 100);
                const b = document.createElement('div');
                b.className = 'key-stat-badge';
                b.innerHTML = `
                    <div class="key-badge-letter" style="color: #FF4A68;">${k.toUpperCase()}</div>
                    <div class="key-badge-acc" style="color: #FF4A68;">${acc}%</div>
                    <div class="key-badge-extra">${s.errors} err</div>
                `;
                weakRow.appendChild(b);
            });

            const strongRow = document.getElementById('strong-keys-badges');
            strongRow.innerHTML = '';
            const strongEntries = Object.entries(this.saveData.keyStats)
                .filter(([k, s]) => (s.correct + s.errors) > 0 && (s.correct / (s.correct + s.errors)) >= 0.90)
                .sort((a, b) => b[1].correct - a[1].correct);

            strongEntries.slice(0, 6).forEach(([k, s]) => {
                const acc = Math.round((s.correct / (s.correct + s.errors)) * 100);
                const b = document.createElement('div');
                b.className = 'key-stat-badge';
                b.innerHTML = `
                    <div class="key-badge-letter" style="color: #42E88A;">${k.toUpperCase()}</div>
                    <div class="key-badge-acc" style="color: #42E88A;">${acc}%</div>
                    <div class="key-badge-extra">${s.correct} hit</div>
                `;
                strongRow.appendChild(b);
            });
        }

        bindTypingTest() {
            document.getElementById('test-back-btn').addEventListener('click', () => {
                this.stopTypingTest();
                this.switchScreen('screen-main-menu');
            });
            document.getElementById('test-res-retry').addEventListener('click', () => {
                document.getElementById('test-result-modal').style.display = 'none';
                this.startTypingTest();
            });
            document.getElementById('test-res-apply').addEventListener('click', () => {
                document.getElementById('test-result-modal').style.display = 'none';
                this.startCombatLevel(this.saveData.unlockedLevel);
            });
        }

        startTypingTest() {
            this.stopTypingTest();
            this.testActive = true;
            const testSentences = [
                "master the ancient warrior rhythm through swift keystrokes to conquer the martial realm",
                "focus your mental energy and strike the training targets with precision and lightning velocity",
                "unleash your inner dragon as precise typing movements overcome every enemy assault",
                "flow like water and strike like thunder to rise through the legendary ninja ranks",
                "true martial mastery requires discipline balance and flawless touch typing execution",
                "defend the sacred temple gates against the shadow clan with swift and accurate reflexes",
                "channel your chakra through every fingertip to deliver devastating combos and knockouts"
            ];
            this.testText = testSentences[Math.floor(Math.random() * testSentences.length)];
            this.testTimer = 60;
            this.testIndex = 0;
            this.testCorrect = 0;
            this.testTotal = 0;

            this.updateTestDisplay();

            document.getElementById('test-timer-num').textContent = `${this.testTimer}s`;
            document.getElementById('test-wpm-num').textContent = '0';
            document.getElementById('test-acc-num').textContent = '100.0%';

            this.testInterval = setInterval(() => {
                this.testTimer--;
                document.getElementById('test-timer-num').textContent = `${this.testTimer}s`;

                const mins = (60 - this.testTimer) / 60;
                const liveWpm = mins > 0 ? Math.round((this.testCorrect / 5) / mins) : 0;
                const liveAcc = this.testTotal > 0 ? ((this.testCorrect / this.testTotal) * 100).toFixed(1) : '100.0';

                document.getElementById('test-wpm-num').textContent = liveWpm;
                document.getElementById('test-acc-num').textContent = `${liveAcc}%`;

                if (this.testTimer <= 0) {
                    this.finishTypingTest();
                }
            }, 1000);
        }

        stopTypingTest() {
            this.testActive = false;
            if (this.testInterval) {
                clearInterval(this.testInterval);
                this.testInterval = null;
            }
        }

        updateTestDisplay() {
            const typedEl = document.getElementById('test-typed-text');
            const curEl = document.getElementById('test-cur-char');
            const remainEl = document.getElementById('test-remain-text');

            if (!typedEl || !curEl || !remainEl) return;

            typedEl.textContent = this.testText.substring(0, this.testIndex);
            curEl.textContent = this.testText.charAt(this.testIndex) === ' ' ? '␣' : this.testText.charAt(this.testIndex);
            remainEl.textContent = this.testText.substring(this.testIndex + 1);

            const nextKeyChar = this.testText.charAt(this.testIndex).toLowerCase();
            document.querySelectorAll('#interactive-test-keyboard .kb-key').forEach(k => {
                k.classList.remove('target-hint');
                const dataK = k.getAttribute('data-key');
                if (dataK === nextKeyChar || (dataK === ' ' && nextKeyChar === ' ')) {
                    k.classList.add('target-hint');
                }
            });
        }

        handleTestKeypress(key) {
            if (!this.testActive) return;
            if (key.length !== 1) return;

            this.testTotal++;
            const expected = this.testText.charAt(this.testIndex);

            this.highlightTestKey(key);

            const kLower = key.toLowerCase();
            if (!this.saveData.keyStats[kLower]) {
                this.saveData.keyStats[kLower] = { correct: 0, errors: 0 };
            }

            if (key === expected) {
                this.testCorrect++;
                this.testIndex++;
                this.saveData.keyStats[kLower].correct++;
                sound.playHitSound(false);

                if (this.testIndex >= this.testText.length) {
                    this.finishTypingTest();
                } else {
                    this.updateTestDisplay();
                }
            } else {
                this.saveData.keyStats[kLower].errors++;
                sound.playTypo();
            }
        }

        highlightTestKey(key) {
            const kb = document.getElementById('interactive-test-keyboard');
            if (!kb) return;

            let query = `.kb-key[data-key="${key.toLowerCase()}"]`;
            if (key === ' ') query = `.kb-key[data-key=" "]`;

            const keyNode = kb.querySelector(query);
            if (keyNode) {
                keyNode.classList.add('pressed');
                setTimeout(() => keyNode.classList.remove('pressed'), 140);
            }
        }

        finishTypingTest() {
            this.stopTypingTest();
            sound.playVictory();

            const elapsedSecs = Math.max(1, 60 - this.testTimer);
            const mins = elapsedSecs / 60;
            const finalWpm = Math.round((this.testCorrect / 5) / mins);
            const finalAcc = this.testTotal > 0 ? ((this.testCorrect / this.testTotal) * 100).toFixed(1) : 100.0;

            let rank = 'B';
            let title = 'B - GOOD ADEPT';
            let unlockedTier = 25;

            if (finalWpm >= 80 && finalAcc >= 95) { rank = 'S'; title = 'S - SUPREME GRANDMASTER'; unlockedTier = 90; }
            else if (finalWpm >= 60 && finalAcc >= 90) { rank = 'A'; title = 'A - EXCELLENT STRIKER'; unlockedTier = 60; }
            else if (finalWpm >= 40) { rank = 'B'; title = 'B - GOOD ADEPT'; unlockedTier = 35; }
            else if (finalWpm >= 25) { rank = 'C'; title = 'C - AVERAGE NINJA'; unlockedTier = 20; }
            else { rank = 'D'; title = 'D - DEVELOPING INITIATE'; unlockedTier = 10; }

            this.saveData.totalTests++;
            this.saveData.practiceTimeSeconds += elapsedSecs;
            if (finalWpm > this.saveData.bestWpm) this.saveData.bestWpm = finalWpm;
            if (unlockedTier > this.saveData.unlockedLevel) this.saveData.unlockedLevel = unlockedTier;
            this.saveProgress();

            document.getElementById('test-result-rank').textContent = rank;
            document.getElementById('test-result-title').textContent = title;
            document.getElementById('test-res-wpm').textContent = `${finalWpm} WPM`;
            document.getElementById('test-res-acc').textContent = `${finalAcc}%`;
            document.getElementById('test-res-tier').textContent = `LEVEL ${unlockedTier}`;
            document.getElementById('test-res-grade').textContent = rank === 'S' || rank === 'A' ? 'STRONG' : 'DEVELOPING';

            document.getElementById('test-result-modal').style.display = 'flex';
        }

        bindCombatHUD() {
            document.getElementById('combat-to-menu-btn').addEventListener('click', () => {
                this.combatMode = 'IDLE';
                sound.stopBGM();
                this.switchScreen('screen-main-menu');
            });
            document.getElementById('pause-btn').addEventListener('click', () => {
                this.togglePause();
            });
            document.getElementById('resume-game-btn').addEventListener('click', () => {
                this.togglePause();
            });
            document.getElementById('quit-to-menu-btn').addEventListener('click', () => {
                document.getElementById('pause-modal').style.display = 'none';
                this.combatMode = 'IDLE';
                sound.stopBGM();
                this.switchScreen('screen-main-menu');
            });

            document.getElementById('audio-toggle-btn').addEventListener('click', (e) => {
                sound.muted = !sound.muted;
                e.target.textContent = sound.muted ? '🔇' : '🔊';
            });
            document.getElementById('bgm-toggle-btn').addEventListener('click', () => {
                sound.toggleBGM();
            });

            document.getElementById('next-level-btn').addEventListener('click', () => {
                document.getElementById('victory-modal').style.display = 'none';
                this.startCombatLevel(Math.min(100, this.currentLevel + 1));
            });
            document.getElementById('retry-level-btn').addEventListener('click', () => {
                document.getElementById('victory-modal').style.display = 'none';
                this.startCombatLevel(this.currentLevel);
            });
            document.getElementById('victory-cert-btn').addEventListener('click', () => {
                this.openCertificateModal();
            });

            document.getElementById('defeat-retry-btn').addEventListener('click', () => {
                document.getElementById('defeat-modal').style.display = 'none';
                this.startCombatLevel(this.currentLevel);
            });
            document.getElementById('defeat-menu-btn').addEventListener('click', () => {
                document.getElementById('defeat-modal').style.display = 'none';
                this.combatMode = 'IDLE';
                sound.stopBGM();
                this.switchScreen('screen-main-menu');
            });

            // Survival Defeat Buttons
            document.getElementById('survival-retry-btn').addEventListener('click', () => {
                document.getElementById('survival-modal').style.display = 'none';
                this.startEndlessMode();
            });
            document.getElementById('survival-menu-btn').addEventListener('click', () => {
                document.getElementById('survival-modal').style.display = 'none';
                this.combatMode = 'IDLE';
                sound.stopBGM();
                this.switchScreen('screen-main-menu');
            });
            document.getElementById('survival-cert-btn').addEventListener('click', () => {
                this.openCertificateModal();
            });
        }

        bindCertificateModal() {
            document.getElementById('close-cert-btn').addEventListener('click', () => {
                document.getElementById('certificate-modal').style.display = 'none';
            });
            document.getElementById('cert-refresh-btn').addEventListener('click', () => {
                const name = document.getElementById('cert-fighter-name').value.trim();
                if (name) {
                    this.saveData.fighterName = name;
                    this.saveProgress();
                }
                this.renderCertificate(name);
            });
            document.getElementById('cert-download-btn').addEventListener('click', () => {
                this.downloadCertificate();
            });
            document.getElementById('cert-copy-btn').addEventListener('click', () => {
                this.copyFighterStats();
            });
        }

        togglePause() {
            const pauseModal = document.getElementById('pause-modal');
            if (this.combatMode === 'PLAYING') {
                this.combatMode = 'PAUSED';
                pauseModal.style.display = 'flex';
            } else if (this.combatMode === 'PAUSED') {
                this.combatMode = 'PLAYING';
                pauseModal.style.display = 'none';
            }
        }

        loadArena(lvl) {
            let foundArena = ARENAS[0];
            for (const a of ARENAS) {
                if (lvl >= a.minLvl && lvl <= a.maxLvl) {
                    foundArena = a;
                    break;
                }
            }
            this.arena = foundArena;
            this.bgImage = new Image();
            this.bgImage.src = this.arena.bg;

            document.getElementById('hud-level-badge').textContent = `LEVEL ${String(lvl).padStart(2, '0')}: ${this.arena.name.toUpperCase()}`;
            document.getElementById('arena-tag-display').textContent = `ARENA ${String(this.arena.id).padStart(2, '0')}: ${this.arena.name.toUpperCase()}`;
        }

        startCombatLevel(lvl, weakPractice = false) {
            this.gameMode = weakPractice ? 'WEAK_KEYS' : 'LEVEL';
            this.currentLevel = lvl;
            this.loadArena(lvl);
            this.switchScreen('screen-combat');

            this.playerHP = 120;
            this.enemyHP = 100;
            this.maxPlayerHP = 120;
            this.maxEnemyHP = 100;

            // Martial Arts Belt update
            const belt = getBeltInfo(this.saveData.unlockedLevel || 1);
            this.player.setBelt(belt);
            const beltBadge = document.getElementById('hud-player-belt');
            if (beltBadge) {
                beltBadge.textContent = belt.name;
                beltBadge.className = `player-belt-tag ${belt.beltClass}`;
            }

            // Chakra Rage Reset
            this.chakra = 0;
            this.isJutsuActive = false;
            const chakraFill = document.getElementById('player-chakra-bar');
            if (chakraFill) chakraFill.style.width = '0%';
            const chakraText = document.getElementById('player-chakra-text');
            if (chakraText) chakraText.textContent = '0%';
            const chakraTag = document.getElementById('chakra-ready-tag');
            if (chakraTag) chakraTag.style.display = 'none';

            // Check Boss Encounter (every 10th level)
            const bossOverlay = document.getElementById('boss-hud-overlay');
            if (lvl % 10 === 0) {
                this.isBossFight = true;
                this.bossConfig = BOSS_CONFIGS[lvl] || BOSS_CONFIGS[10];
                this.bossMaxHP = this.bossConfig.hp;
                this.bossHP = this.bossConfig.hp;
                this.bossPhase = 1;

                this.enemy.setArchetype('BOSS', true);
                if (bossOverlay) bossOverlay.style.display = 'block';
                const bName = document.getElementById('boss-name-tag');
                if (bName) bName.textContent = this.bossConfig.name;
                const bPhase = document.getElementById('boss-phase-badge');
                if (bPhase) {
                    bPhase.textContent = 'PHASE 1';
                    bPhase.className = 'boss-phase-badge';
                }
                const bHpFill = document.getElementById('boss-hp-fill');
                if (bHpFill) bHpFill.style.width = '100%';

                this.enemyAttackInterval = 5.0;
                sound.playBossRoar();
                sound.setBGMTempo(136);
            } else {
                this.isBossFight = false;
                if (bossOverlay) bossOverlay.style.display = 'none';

                // Archetypes
                if (lvl % 3 === 0) this.enemy.setArchetype('SCOUT');
                else if (lvl % 4 === 0) this.enemy.setArchetype('TANK');
                else this.enemy.setArchetype('STANDARD');

                this.enemyAttackInterval = Math.max(3.0, 5.2 - (lvl * 0.02));
                sound.setBGMTempo(124);
            }

            // Hide Endless HUD
            const endlessPanel = document.getElementById('endless-hud-panel');
            if (endlessPanel) endlessPanel.style.display = 'none';

            this.combo = 0;
            this.maxCombo = 0;
            this.player.combo = 0;
            this.totalKeypresses = 0;
            this.correctKeypresses = 0;
            this.matchStartTime = Date.now();
            this.enemyAttackTimer = 0;

            this.combatMode = 'PLAYING';

            this.wordsRequired = this.isBossFight 
                ? getWordsRequiredForLevel(lvl) 
                : (weakPractice ? 8 : getWordsRequiredForLevel(lvl));
            this.wordsCompleted = 0;
            this.updateLevelProgressDisplay();

            document.getElementById('victory-modal').style.display = 'none';
            document.getElementById('defeat-modal').style.display = 'none';
            document.getElementById('survival-modal').style.display = 'none';
            document.getElementById('pause-modal').style.display = 'none';

            this.nextCombatWord(weakPractice);
            this.updateCombatHUD();
        }

        startEndlessMode() {
            this.gameMode = 'ENDLESS';
            this.currentLevel = 1;
            this.endlessWave = 1;
            this.endlessLives = 3;
            this.endlessKills = 0;
            this.loadArena(1);
            this.switchScreen('screen-combat');

            this.playerHP = 100;
            this.enemyHP = 100;
            this.maxPlayerHP = 100;
            this.maxEnemyHP = 100;

            const belt = getBeltInfo(this.saveData.unlockedLevel || 1);
            this.player.setBelt(belt);
            const beltBadge = document.getElementById('hud-player-belt');
            if (beltBadge) {
                beltBadge.textContent = belt.name;
                beltBadge.className = `player-belt-tag ${belt.beltClass}`;
            }

            // Show Endless HUD
            const endlessPanel = document.getElementById('endless-hud-panel');
            if (endlessPanel) endlessPanel.style.display = 'inline-flex';
            document.getElementById('endless-wave-tag').textContent = 'WAVE 01';
            document.getElementById('endless-lives-tag').textContent = '❤️❤️❤️';

            // Hide Boss HUD
            const bossOverlay = document.getElementById('boss-hud-overlay');
            if (bossOverlay) bossOverlay.style.display = 'none';
            this.isBossFight = false;

            this.enemy.setArchetype('STANDARD');
            this.enemyAttackInterval = 3.6;

            this.chakra = 0;
            this.isJutsuActive = false;
            document.getElementById('player-chakra-bar').style.width = '0%';
            document.getElementById('player-chakra-text').textContent = '0%';
            document.getElementById('chakra-ready-tag').style.display = 'none';

            this.combo = 0;
            this.maxCombo = 0;
            this.player.combo = 0;
            this.totalKeypresses = 0;
            this.correctKeypresses = 0;
            this.matchStartTime = Date.now();
            this.enemyAttackTimer = 0;

            this.combatMode = 'PLAYING';
            this.wordsRequired = 1;
            this.wordsCompleted = 0;
            this.updateLevelProgressDisplay();
            sound.setBGMTempo(128);

            document.getElementById('victory-modal').style.display = 'none';
            document.getElementById('defeat-modal').style.display = 'none';
            document.getElementById('survival-modal').style.display = 'none';
            document.getElementById('pause-modal').style.display = 'none';

            this.nextCombatWord();
            this.updateCombatHUD();
        }

        startWeakKeysDrill() {
            // Find weakest keys with < 85% accuracy
            const weak = Object.entries(this.saveData.keyStats || {})
                .filter(([k, s]) => (s.correct + s.errors) > 0 && (s.correct / (s.correct + s.errors)) < 0.85)
                .map(([k]) => k);

            this.targetedWeakKeys = weak.length >= 2 ? weak : ['b', 'z', 'q', 'x', 'p'];
            this.startCombatLevel(this.saveData.unlockedLevel || 1, true);
            this.fx.spawnFloatingText(`DRILL: [${this.targetedWeakKeys.join(', ').toUpperCase()}]`, 640, 300, '#00D2FF');
        }

        updateLevelProgressDisplay() {
            const counter = document.getElementById('level-word-counter');
            if (!counter) return;

            if (this.gameMode === 'ENDLESS') {
                counter.textContent = `🌊 WAVE ${String(this.endlessWave).padStart(2, '0')} • KO: ${this.endlessKills}`;
            } else if (this.isBossFight) {
                counter.textContent = `👹 BOSS STRIKE: ${Math.min(this.wordsRequired, this.wordsCompleted + 1)} / ${this.wordsRequired}`;
            } else if (this.gameMode === 'WEAK_KEYS') {
                counter.textContent = `🎯 DRILL STRIKE: ${Math.min(this.wordsRequired, this.wordsCompleted + 1)} / ${this.wordsRequired}`;
            } else {
                counter.textContent = `🥋 STRIKE: ${Math.min(this.wordsRequired, this.wordsCompleted + 1)} / ${this.wordsRequired}`;
            }
        }

        nextCombatWord(weakPractice = false) {
            if (this.isJutsuActive) {
                this.activeWord = JUTSU_WORDS[Math.floor(Math.random() * JUTSU_WORDS.length)];
            } else if (weakPractice || this.gameMode === 'WEAK_KEYS') {
                const weakWords = [
                    "blaze", "breeze", "hazard", "strike", "shadow", "punch", "focus",
                    "quick", "quartz", "quiver", "zenith", "zigzag", "vortex", "velvet",
                    "cipher", "combat", "clutch", "boxer", "bronze", "buffer", "puzzle",
                    "matrix", "vector", "binary", "system", "rhythm", "chakra", "falcon",
                    "wizard", "oxygen", "pixel", "jockey", "jacket", "jaguar", "jungle",
                    "knuckle", "knight", "plasma", "sphinx", "mystic", "freeze", "bizarre"
                ];
                const pool = weakWords.filter(w => w !== this.activeWord);
                this.activeWord = pool[Math.floor(Math.random() * pool.length)];
            } else {
                this.activeWord = getWordForLevel(this.currentLevel);
            }
            this.typedIndex = 0;
            this.updateCombatWordDisplay();
        }

        updateCombatWordDisplay() {
            const typedPart = document.getElementById('typed-part');
            const currentChar = document.getElementById('current-char');
            const remainingPart = document.getElementById('remaining-part');

            if (!typedPart || !currentChar || !remainingPart) return;

            typedPart.textContent = this.activeWord.substring(0, this.typedIndex);
            currentChar.textContent = this.activeWord.charAt(this.typedIndex);
            remainingPart.textContent = this.activeWord.substring(this.typedIndex + 1);
        }

        handleCombatKeypress(key) {
            if (this.combatMode !== 'PLAYING') return;
            if (key.length !== 1) return;

            this.totalKeypresses++;
            const targetChar = this.activeWord.charAt(this.typedIndex).toLowerCase();
            const inputChar = key.toLowerCase();

            if (!this.saveData.keyStats[inputChar]) {
                this.saveData.keyStats[inputChar] = { correct: 0, errors: 0 };
            }

            if (inputChar === targetChar) {
                this.correctKeypresses++;
                this.typedIndex++;
                this.combo++;
                if (this.combo > this.maxCombo) this.maxCombo = this.combo;
                this.player.combo = this.combo;
                this.saveData.keyStats[inputChar].correct++;

                const moves = ['JAB', 'PUNCH', 'KICK', 'UPPERCUT'];
                const selectedMove = moves[this.combo % moves.length];
                this.player.triggerAttack(selectedMove);
                this.enemy.triggerHurt();

                sound.playHitSound(false);
                sound.playCombo(this.combo);

                this.fx.spawnHitSparks(this.enemy.x - 20, this.enemy.y - 120, this.isJutsuActive ? '#FFD700' : '#00D2FF');

                // Chakra Rage Meter Charging
                if (!this.isJutsuActive) {
                    this.chakra = Math.min(100, this.chakra + 2.5 + Math.min(this.combo * 0.15, 3));
                    if (this.chakra >= 100) {
                        this.isJutsuActive = true;
                        sound.playJutsuReady();
                        this.fx.spawnFloatingText("★ CHAKRA 100%! JUTSU READY! ★", 640, 300, "#FFD700");
                        this.screenShake = 8;
                        const readyTag = document.getElementById('chakra-ready-tag');
                        if (readyTag) readyTag.style.display = 'block';
                        const chakraBar = document.getElementById('player-chakra-bar');
                        if (chakraBar) chakraBar.classList.add('chakra-full-anim');
                    }
                }

                // Calculate exact smooth combat health progression
                if (this.gameMode === 'ENDLESS') {
                    const charDmg = (100 / (this.activeWord.length * (this.isBossFight ? 3.0 : 1.2)));
                    this.enemyHP = Math.max(0, this.enemyHP - charDmg);
                } else {
                    const currentWordRatio = this.activeWord.length > 0 ? (this.typedIndex / this.activeWord.length) : 0;
                    const totalProgress = Math.min(1.0, (this.wordsCompleted + currentWordRatio) / this.wordsRequired);

                    if (this.isBossFight) {
                        this.bossHP = Math.max(0, (1 - totalProgress) * this.bossMaxHP);
                        this.enemyHP = Math.max(0, (this.bossHP / this.bossMaxHP) * 100);

                        // Boss Phase 2 (Berserk below 50% HP)
                        if (this.bossHP <= this.bossMaxHP * 0.5 && this.bossPhase === 1) {
                            this.bossPhase = 2;
                            this.enemy.isBerserk = true;
                            sound.playBossRoar();
                            this.screenShake = 18;
                            this.fx.spawnExplosion(this.enemy.x, this.enemy.y - 120, 35, '#FF2A4B');
                            this.fx.spawnFloatingText("⚠️ BERSERK PHASE 2 ACTIVATED! ⚠️", 640, 240, '#FF2A4B');
                            const bPhase = document.getElementById('boss-phase-badge');
                            if (bPhase) {
                                bPhase.textContent = 'BERSERK PHASE 2';
                                bPhase.className = 'boss-phase-badge berserk';
                            }
                            this.enemyAttackInterval = 3.8; // Controlled intense pressure
                        }
                    } else {
                        this.enemyHP = Math.max(0, (1 - totalProgress) * 100);
                    }
                }

                if (this.combo > 0 && this.combo % 5 === 0) {
                    this.fx.spawnFloatingText(`${this.combo}x COMBO!`, 640, 360, '#FFD700');
                    this.screenShake = 6;
                }

                // Word Completed
                if (this.typedIndex >= this.activeWord.length) {
                    if (this.isJutsuActive) {
                        // CHAKRA JUTSU UNLEASHED!
                        this.hitStopTimer = 0.05; // 50ms AAA impact freeze
                        sound.playJutsuUnleashed();
                        this.screenShake = 24;
                        this.fx.spawnExplosion(this.enemy.x, this.enemy.y - 130, 45, '#FFD700');
                        this.fx.spawnFloatingText("★ CHAKRA JUTSU OBLITERATION! ★", 640, 250, '#FFD700');

                        // Advances 2 words (current + 1 bonus strike!)
                        this.wordsCompleted = Math.min(this.wordsRequired, this.wordsCompleted + 2);

                        // Big heal on Chakra Jutsu!
                        this.playerHP = Math.min(this.maxPlayerHP, this.playerHP + 15);
                        this.fx.spawnFloatingText("+15 HP HEAL!", this.player.x, this.player.y - 180, '#42E88A');

                        this.chakra = 0;
                        this.isJutsuActive = false;
                        const readyTag = document.getElementById('chakra-ready-tag');
                        if (readyTag) readyTag.style.display = 'none';
                        const chakraBar = document.getElementById('player-chakra-bar');
                        if (chakraBar) chakraBar.classList.remove('chakra-full-anim');
                    } else {
                        // Normal Finisher Kick
                        this.player.triggerAttack('KICK');
                        this.enemy.triggerHurt();
                        sound.playHitSound(true);
                        this.screenShake = 12;
                        this.fx.spawnHitSparks(this.enemy.x, this.enemy.y - 140, '#FFD700');
                        this.fx.spawnFloatingText("FINISHER!", this.enemy.x, this.enemy.y - 180, '#42E88A');

                        this.wordsCompleted++;

                        // Word completion reward: gentle health regeneration
                        const healAmount = this.isBossFight ? 4 : 2;
                        this.playerHP = Math.min(this.maxPlayerHP, this.playerHP + healAmount);
                    }

                    // Re-sync HP at word completion
                    if (this.gameMode !== 'ENDLESS') {
                        const completedProgress = Math.min(1.0, this.wordsCompleted / this.wordsRequired);
                        if (this.isBossFight) {
                            this.bossHP = Math.max(0, (1 - completedProgress) * this.bossMaxHP);
                            this.enemyHP = Math.max(0, (this.bossHP / this.bossMaxHP) * 100);
                        } else {
                            this.enemyHP = Math.max(0, (1 - completedProgress) * 100);
                        }
                    }

                    this.updateLevelProgressDisplay();

                    // Check Enemy KO
                    const isEnemyDead = (this.gameMode === 'ENDLESS') 
                        ? (this.enemyHP <= 0) 
                        : (this.wordsCompleted >= this.wordsRequired || (this.isBossFight ? this.bossHP <= 0 : this.enemyHP <= 0));
                    if (isEnemyDead) {
                        if (this.gameMode === 'ENDLESS') {
                            this.endlessKills++;
                            this.endlessWave++;
                            sound.playVictory();
                            this.fx.spawnFloatingText(`WAVE ${this.endlessWave}!`, 640, 320, '#42E88A');
                            this.screenShake = 14;

                            // Reset enemy for next wave
                            this.enemyHP = 100;
                            this.enemyAttackInterval = Math.max(1.4, 3.8 - (this.endlessWave * 0.05));
                            if (this.endlessWave % 5 === 0) {
                                this.isBossFight = true;
                                this.bossMaxHP = 180 + (this.endlessWave * 15);
                                this.bossHP = this.bossMaxHP;
                                this.bossPhase = 1;
                                this.enemy.setArchetype('BOSS', true);
                                const bossOverlay = document.getElementById('boss-hud-overlay');
                                if (bossOverlay) bossOverlay.style.display = 'block';
                                document.getElementById('boss-name-tag').textContent = `WAVE ${this.endlessWave} DEMON BOSS 👹`;
                            } else {
                                this.isBossFight = false;
                                const bossOverlay = document.getElementById('boss-hud-overlay');
                                if (bossOverlay) bossOverlay.style.display = 'none';
                                this.enemy.setArchetype(this.endlessWave % 2 === 0 ? 'SCOUT' : (this.endlessWave % 3 === 0 ? 'TANK' : 'STANDARD'));
                            }
                            document.getElementById('endless-wave-tag').textContent = `WAVE ${String(this.endlessWave).padStart(2, '0')}`;
                            this.nextCombatWord();
                        } else {
                            this.handleCombatVictory();
                        }
                    } else {
                        this.nextCombatWord();
                    }
                } else {
                    this.updateCombatWordDisplay();
                }
            } else {
                // Typo / Miss
                this.combo = 0;
                this.player.combo = 0;
                this.saveData.keyStats[inputChar].errors++;
                sound.playTypo();
                this.screenShake = 8;
                this.fx.spawnFloatingText("MISS!", this.player.x, this.player.y - 160, '#FF2A4B');

                this.enemy.triggerAttack('PUNCH');
                this.player.triggerHurt();
                sound.playHitSound(false);

                if (this.gameMode === 'ENDLESS') {
                    this.endlessLives--;
                    sound.playLifeLost();
                    this.screenShake = 14;
                    this.fx.spawnFloatingText("HEART LOST!", this.player.x, this.player.y - 180, '#FF2A4B');
                    const hearts = "❤️".repeat(Math.max(0, this.endlessLives)) + "🖤".repeat(3 - Math.max(0, this.endlessLives));
                    document.getElementById('endless-lives-tag').textContent = hearts;

                    if (this.endlessLives <= 0) {
                        this.handleEndlessDefeat();
                    }
                } else {
                    const typoDamage = 1.5;
                    this.playerHP = Math.max(0, this.playerHP - typoDamage);
                    if (this.playerHP <= 0) {
                        this.handleCombatDefeat();
                    }
                }
            }

            this.updateCombatHUD();
        }

        updateCombatHUD() {
            const playerFill = document.getElementById('player-hp-bar');
            const playerText = document.getElementById('player-hp-text');
            const enemyFill = document.getElementById('enemy-hp-bar');
            const enemyText = document.getElementById('enemy-hp-text');
            const chakraFill = document.getElementById('player-chakra-bar');
            const chakraText = document.getElementById('player-chakra-text');

            if (playerFill) playerFill.style.width = `${Math.max(0, (this.playerHP / this.maxPlayerHP) * 100)}%`;
            if (playerText) playerText.textContent = `${Math.round(this.playerHP)} / ${this.maxPlayerHP}`;

            if (chakraFill) chakraFill.style.width = `${Math.max(0, this.chakra)}%`;
            if (chakraText) chakraText.textContent = `${Math.round(this.chakra)}%`;

            if (this.isBossFight) {
                const bossFill = document.getElementById('boss-hp-fill');
                if (bossFill) bossFill.style.width = `${Math.max(0, (this.bossHP / this.bossMaxHP) * 100)}%`;
                if (enemyFill) enemyFill.style.width = `${Math.max(0, (this.bossHP / this.bossMaxHP) * 100)}%`;
                if (enemyText) enemyText.textContent = `${Math.round(this.bossHP)} / ${this.bossMaxHP}`;
            } else {
                if (enemyFill) enemyFill.style.width = `${Math.max(0, (this.enemyHP / this.maxEnemyHP) * 100)}%`;
                if (enemyText) enemyText.textContent = `${Math.round(this.enemyHP)} / ${this.maxEnemyHP}`;
            }

            const elapsedMins = (Date.now() - this.matchStartTime) / 60000;
            const wpm = elapsedMins > 0 ? Math.round((this.correctKeypresses / 5) / elapsedMins) : 0;
            const acc = this.totalKeypresses > 0 ? Math.round((this.correctKeypresses / this.totalKeypresses) * 100) : 100;

            document.getElementById('hud-wpm').textContent = wpm;
            document.getElementById('hud-acc').textContent = `${acc}%`;
            document.getElementById('hud-combo').textContent = `${this.combo}x`;
        }

        handleCombatVictory() {
            this.combatMode = 'VICTORY';
            sound.playVictory();

            const elapsedSecs = Math.round((Date.now() - this.matchStartTime) / 1000);
            const elapsedMins = elapsedSecs / 60;
            const wpm = elapsedMins > 0 ? Math.round((this.correctKeypresses / 5) / elapsedMins) : 0;
            const acc = this.totalKeypresses > 0 ? Math.round((this.correctKeypresses / this.totalKeypresses) * 100) : 100;

            const score = Math.round((wpm * 0.40) + (acc * 0.40) + 20.0);
            let rank = 'S';
            let rankName = 'S - SUPREME GRANDMASTER';
            if (score < 50) { rank = 'D'; rankName = 'D - DEVELOPING INITIATE'; }
            else if (score < 65) { rank = 'C'; rankName = 'C - AVERAGE NINJA'; }
            else if (score < 80) { rank = 'B'; rankName = 'B - GOOD ADEPT'; }
            else if (score < 90) { rank = 'A'; rankName = 'A - EXCELLENT STRIKER'; }

            let starCount = 3;
            if (acc < 90 || this.playerHP < 50) starCount = 2;
            if (acc < 80) starCount = 1;

            if (this.currentLevel >= this.saveData.unlockedLevel && this.currentLevel < 100) {
                this.saveData.unlockedLevel = this.currentLevel + 1;
            }
            this.saveData.stars[this.currentLevel] = Math.max(this.saveData.stars[this.currentLevel] || 0, starCount);
            if (wpm > this.saveData.bestWpm) this.saveData.bestWpm = wpm;
            this.saveData.practiceTimeSeconds += elapsedSecs;
            this.saveData.completedCount = Math.max(this.saveData.completedCount, this.currentLevel);
            this.saveData.totalScore += (score * 10);
            this.saveProgress();

            document.getElementById('victory-stage-title').textContent = this.isBossFight ? `${this.bossConfig.name} VANQUISHED!` : `LEVEL ${this.currentLevel} DEFEATED`;
            document.getElementById('victory-rank-stamp').textContent = rank;
            document.getElementById('victory-rank-name').textContent = rankName;
            document.getElementById('v-wpm').textContent = `${wpm} WPM`;
            document.getElementById('v-acc').textContent = `${acc}%`;
            document.getElementById('v-combo').textContent = `${this.maxCombo}x`;
            document.getElementById('v-stars').textContent = '⭐'.repeat(starCount);

            document.getElementById('victory-modal').style.display = 'flex';
        }

        handleCombatDefeat() {
            this.combatMode = 'DEFEAT';
            sound.playDefeat();

            const elapsedMins = (Date.now() - this.matchStartTime) / 60000;
            const wpm = elapsedMins > 0 ? Math.round((this.correctKeypresses / 5) / elapsedMins) : 0;
            const acc = this.totalKeypresses > 0 ? Math.round((this.correctKeypresses / this.totalKeypresses) * 100) : 100;

            document.getElementById('d-wpm').textContent = wpm;
            document.getElementById('d-acc').textContent = `${acc}%`;

            document.getElementById('defeat-modal').style.display = 'flex';
        }

        handleEndlessDefeat() {
            this.combatMode = 'DEFEAT';
            sound.playDefeat();

            const elapsedMins = (Date.now() - this.matchStartTime) / 60000;
            const wpm = elapsedMins > 0 ? Math.round((this.correctKeypresses / 5) / elapsedMins) : 0;

            this.saveData.survivalBestWave = Math.max(this.saveData.survivalBestWave || 1, this.endlessWave);
            this.saveData.survivalHighScore = Math.max(this.saveData.survivalHighScore || 0, this.endlessKills);
            this.saveProgress();

            document.getElementById('s-waves').textContent = this.endlessWave;
            document.getElementById('s-kills').textContent = this.endlessKills;
            document.getElementById('s-wpm').textContent = `${wpm} WPM`;
            document.getElementById('survival-waves-desc').textContent = `You defended the Dojo with honor across ${this.endlessWave} waves of ninja invaders!`;

            document.getElementById('survival-modal').style.display = 'flex';
        }

        openCertificateModal() {
            const modal = document.getElementById('certificate-modal');
            const nameInput = document.getElementById('cert-fighter-name');
            if (nameInput) {
                nameInput.value = this.saveData.fighterName || "WARRIOR RISHU";
            }
            modal.style.display = 'flex';
            this.renderCertificate(nameInput ? nameInput.value : "WARRIOR RISHU");
        }

        renderCertificate(fighterName) {
            const canvas = document.getElementById('cert-canvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const W = canvas.width;
            const H = canvas.height;

            // 1. Dark Dojo Background Gradient
            const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, 700);
            bgGrad.addColorStop(0, '#111726');
            bgGrad.addColorStop(0.7, '#090D16');
            bgGrad.addColorStop(1, '#04060A');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, W, H);

            // Subtle martial arts diagonal line pattern
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 42, 75, 0.05)';
            ctx.lineWidth = 1;
            for (let i = -W; i < W * 2; i += 40) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i + H, H);
                ctx.stroke();
            }
            ctx.restore();

            // 2. Multi-layered Borders
            // Outer Gold Border
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 6;
            ctx.strokeRect(28, 28, W - 56, H - 56);

            // Inner Crimson Border
            ctx.strokeStyle = '#FF2A4B';
            ctx.lineWidth = 2;
            ctx.strokeRect(40, 40, W - 80, H - 80);

            // Corner Martial Knots
            const drawCornerKnot = (cx, cy, rot) => {
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(rot);
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(32, 0);
                ctx.lineTo(32, 32);
                ctx.stroke();

                ctx.fillStyle = '#FF2A4B';
                ctx.beginPath();
                ctx.arc(16, 16, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            };
            drawCornerKnot(48, 48, 0);
            drawCornerKnot(W - 48, 48, Math.PI / 2);
            drawCornerKnot(W - 48, H - 48, Math.PI);
            drawCornerKnot(48, H - 48, -Math.PI / 2);

            // 3. Central Watermark (Martial Arts Kanji "武 術")
            ctx.save();
            ctx.font = 'bold 220px serif';
            ctx.fillStyle = 'rgba(255, 215, 0, 0.035)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('武 術', W / 2, H / 2 + 10);
            ctx.restore();

            // 4. Header Titles
            ctx.textAlign = 'center';

            ctx.font = 'bold 15px "Space Grotesk", sans-serif';
            ctx.fillStyle = '#00D2FF';
            ctx.letterSpacing = '0.2em';
            ctx.fillText('🥋 RISHU KEY JUTSU ACADEMY • CODE WITH RISHABH 🥋', W / 2, 95);

            ctx.font = '900 38px "Outfit", sans-serif';
            ctx.fillStyle = '#FFD700';
            ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
            ctx.shadowBlur = 15;
            ctx.fillText('CERTIFICATE OF MARTIAL TOUCH-TYPING MASTERY', W / 2, 148);
            ctx.shadowBlur = 0;

            // Thin Decorative Gold Divider
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(W / 2 - 240, 168);
            ctx.lineTo(W / 2 + 240, 168);
            ctx.stroke();

            // Central Diamond
            ctx.fillStyle = '#FF2A4B';
            ctx.beginPath();
            ctx.moveTo(W / 2, 163);
            ctx.lineTo(W / 2 + 6, 168);
            ctx.lineTo(W / 2, 173);
            ctx.lineTo(W / 2 - 6, 168);
            ctx.fill();

            // Conferred Tag
            ctx.font = '700 15px "Space Grotesk", sans-serif';
            ctx.fillStyle = '#8C99AB';
            ctx.letterSpacing = '0.15em';
            ctx.fillText('THIS PRESTIGIOUS RANK IS PROUDLY CONFERRED UPON', W / 2, 215);

            // Fighter Name (Editable)
            const name = (fighterName || this.saveData.fighterName || "WARRIOR RISHU").toUpperCase();
            ctx.font = '900 46px "Outfit", sans-serif';
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = 'rgba(0, 210, 255, 0.8)';
            ctx.shadowBlur = 16;
            ctx.fillText(name, W / 2, 275);
            ctx.shadowBlur = 0;

            // Citation Paragraph
            ctx.font = 'italic 16px "Outfit", sans-serif';
            ctx.fillStyle = '#A0AEC0';
            ctx.fillText('Having demonstrated lightning reflexes, unerring keystroke precision, and supreme warrior discipline', W / 2, 320);
            ctx.fillText('by conquering the touch-typing combat arenas of Rishu Key Jutsu.', W / 2, 345);

            // 5. Four Luxury Stat Badges
            const belt = getBeltInfo(this.saveData.unlockedLevel || 1);
            const stats = [
                { lbl: 'BELT RANK', val: belt.name, sub: belt.title, color: belt.color },
                { lbl: 'BEST COMBAT SPEED', val: `${this.saveData.bestWpm} WPM`, sub: 'Peak Keystroke Rate', color: '#00D2FF' },
                { lbl: 'ACCURACY RATING', val: `${this.saveData.bestAcc}%`, sub: 'Striking Precision', color: '#42E88A' },
                { lbl: 'STAGES CONQUERED', val: `${this.saveData.completedCount || 1} / 100`, sub: 'Arenas Defeated', color: '#FFD700' }
            ];

            const cardW = 235;
            const cardH = 105;
            const gap = 24;
            const startX = (W - (4 * cardW + 3 * gap)) / 2;
            const cardY = 385;

            stats.forEach((s, idx) => {
                const cx = startX + idx * (cardW + gap);

                ctx.fillStyle = 'rgba(17, 23, 38, 0.9)';
                ctx.strokeStyle = s.color;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                if (ctx.roundRect) ctx.roundRect(cx, cardY, cardW, cardH, 8);
                else ctx.rect(cx, cardY, cardW, cardH);
                ctx.fill();
                ctx.stroke();

                ctx.font = '700 11px "Space Grotesk", sans-serif';
                ctx.fillStyle = '#6C7A8E';
                ctx.textAlign = 'center';
                ctx.fillText(s.lbl, cx + cardW / 2, cardY + 24);

                ctx.font = '800 24px "Space Grotesk", sans-serif';
                ctx.fillStyle = s.color;
                ctx.fillText(s.val, cx + cardW / 2, cardY + 58);

                ctx.font = '600 11px "Space Grotesk", sans-serif';
                ctx.fillStyle = '#9DA8B8';
                ctx.fillText(s.sub, cx + cardW / 2, cardY + 84);
            });

            // 6. Seal, Signatures & Footer
            const sealX = 220;
            const sealY = 640;
            ctx.save();
            ctx.translate(sealX, sealY);
            ctx.strokeStyle = '#FF2A4B';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(0, 0, 52, 0, Math.PI * 2);
            ctx.stroke();

            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, 44, 0, Math.PI * 2);
            ctx.stroke();

            ctx.font = '900 28px serif';
            ctx.fillStyle = '#FF2A4B';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('極 伝', 0, -4);

            ctx.font = '700 8px "Space Grotesk", sans-serif';
            ctx.fillText('KEY JUTSU DOJO', 0, 24);
            ctx.fillText('VERIFIED 2026', 0, 34);
            ctx.restore();

            // Center Date and Seal Text
            ctx.textAlign = 'center';
            ctx.font = '700 13px "Space Grotesk", sans-serif';
            ctx.fillStyle = '#6C7A8E';
            const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            ctx.fillText(`ISSUED: ${today}`, W / 2, 620);
            ctx.fillText(`CERTIFICATE ID: RJ-${Math.abs((this.saveData.totalScore || 7431) * 73).toString(16).toUpperCase().padStart(8, '0')}`, W / 2, 642);

            ctx.font = '700 12px "Space Grotesk", sans-serif';
            ctx.fillStyle = '#00D2FF';
            ctx.fillText('https://keyjutsu-game.vercel.app', W / 2, 668);

            // Sensei Signature on Right
            const sigX = W - 240;
            const sigY = 610;

            ctx.textAlign = 'center';
            ctx.font = 'italic 26px "Brush Script MT", cursive, sans-serif';
            ctx.fillStyle = '#00D2FF';
            ctx.fillText('Rishabh Yadav', sigX, sigY);

            ctx.strokeStyle = 'rgba(0, 210, 255, 0.5)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(sigX - 90, sigY + 10);
            ctx.lineTo(sigX + 90, sigY + 10);
            ctx.stroke();

            ctx.font = '800 12px "Space Grotesk", sans-serif';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText('RISHABH YADAV (RISHU)', sigX, sigY + 28);

            ctx.font = '600 11px "Space Grotesk", sans-serif';
            ctx.fillStyle = '#8C99AB';
            ctx.fillText('FOUNDER • CODE WITH RISHABH', sigX, sigY + 44);
        }

        downloadCertificate() {
            const canvas = document.getElementById('cert-canvas');
            if (!canvas) return;
            const link = document.createElement('a');
            const fighterName = (this.saveData.fighterName || 'Rishu').replace(/\s+/g, '_');
            link.download = `Rishu-KeyJutsu-Master-Certificate-${fighterName}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }

        copyFighterStats() {
            const belt = getBeltInfo(this.saveData.unlockedLevel || 1);
            const text = `🥋 RISHU KEY JUTSU FIGHTER RECORD 🥋\n` +
                         `Warrior: ${this.saveData.fighterName || 'Warrior Rishu'}\n` +
                         `Rank: ${belt.name} (${belt.title})\n` +
                         `Speed: ${this.saveData.bestWpm} WPM | Accuracy: ${this.saveData.bestAcc}%\n` +
                         `Arenas Conquered: ${this.saveData.completedCount || 1} / 100\n` +
                         `Play & Defend Dojo: https://keyjutsu-game.vercel.app\n#KeyJutsu #CodeWithRishabh`;

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => {
                    alert('🥋 Fighter Record copied to clipboard! Share your martial arts rank with friends!');
                }).catch(() => {
                    prompt('Copy your fighter stats:', text);
                });
            } else {
                prompt('Copy your fighter stats:', text);
            }
        }

        bindGlobalKeyboard() {
            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    if (this.activeScreen === 'screen-combat') {
                        this.togglePause();
                    } else if (this.activeScreen !== 'screen-main-menu') {
                        sound.stopBGM();
                        this.switchScreen('screen-main-menu');
                    }
                    return;
                }

                if (this.activeScreen === 'screen-combat') {
                    if (e.key === ' ') e.preventDefault();
                    this.handleCombatKeypress(e.key);
                } else if (this.activeScreen === 'screen-typing-test') {
                    if (e.key === ' ') e.preventDefault();
                    this.handleTestKeypress(e.key);
                }
            });
        }

        initGameLoop() {
            let lastTime = performance.now();

            const loop = (currentTime) => {
                const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
                lastTime = currentTime;

                if (this.activeScreen === 'screen-combat') {
                    this.update(dt);
                    this.render();
                }

                requestAnimationFrame(loop);
            };

            requestAnimationFrame(loop);
        }

        update(dt) {
            // AAA Hit-Stop freeze frame
            if (this.hitStopTimer > 0) {
                this.hitStopTimer -= dt;
                return;
            }

            if (this.combatMode === 'PLAYING') {
                this.enemyAttackTimer += dt;
                if (this.enemyAttackTimer >= this.enemyAttackInterval) {
                    this.enemyAttackTimer = 0;
                    this.enemy.triggerAttack('PUNCH');
                    this.player.triggerHurt();
                    sound.playHitSound(false);
                    this.screenShake = 6;
                    this.combo = 0;
                    this.player.combo = 0;

                    if (this.gameMode === 'ENDLESS') {
                        this.endlessLives--;
                        sound.playLifeLost();
                        this.screenShake = 14;
                        this.fx.spawnFloatingText("HEART LOST!", this.player.x, this.player.y - 180, '#FF2A4B');
                        const hearts = "❤️".repeat(Math.max(0, this.endlessLives)) + "🖤".repeat(3 - Math.max(0, this.endlessLives));
                        document.getElementById('endless-lives-tag').textContent = hearts;
                        if (this.endlessLives <= 0) {
                            this.handleEndlessDefeat();
                        }
                    } else {
                        const enemyDmg = this.isBossFight ? 6 : 4;
                        this.playerHP = Math.max(0, this.playerHP - enemyDmg);
                        if (this.playerHP <= 0) {
                            this.handleCombatDefeat();
                        }
                    }
                    this.updateCombatHUD();
                }
            }

            this.player.update(dt);
            this.enemy.update(dt);
            this.fx.update(dt);

            if (this.screenShake > 0) {
                this.screenShake = Math.max(0, this.screenShake - dt * 25);
            }
        }

        render() {
            if (!this.ctx) return;
            this.ctx.save();

            if (this.screenShake > 0) {
                const shakeX = (Math.random() * 2 - 1) * this.screenShake;
                const shakeY = (Math.random() * 2 - 1) * this.screenShake;
                this.ctx.translate(shakeX, shakeY);
            }

            if (this.bgImage.complete && this.bgImage.naturalWidth !== 0) {
                this.ctx.drawImage(this.bgImage, 0, 0, this.canvas.width, this.canvas.height);
            } else {
                this.ctx.fillStyle = '#080B10';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }

            const grad = this.ctx.createLinearGradient(0, 480, 0, 720);
            grad.addColorStop(0, 'rgba(5, 8, 14, 0.15)');
            grad.addColorStop(1, 'rgba(5, 8, 14, 0.88)');
            this.ctx.fillStyle = grad;
            this.ctx.fillRect(0, 480, this.canvas.width, 240);

            this.player.draw(this.ctx);
            this.enemy.draw(this.ctx);

            // Floating Word Directly Above Enemy's Head (Screens 5 & 6)
            if (this.combatMode === 'PLAYING' && this.activeWord) {
                const wordX = this.enemy.x;
                const wordY = this.enemy.y - 210 * (this.enemy.isBoss ? 1.25 : 1.0);

                this.ctx.save();
                this.ctx.font = 'bold 34px "Space Grotesk", sans-serif';

                const metrics = this.ctx.measureText(this.activeWord);
                const pillW = metrics.width + 42;
                const pillH = 48;

                // Round rect backdrop
                this.ctx.fillStyle = 'rgba(7, 11, 20, 0.9)';
                if (this.isJutsuActive) {
                    this.ctx.strokeStyle = '#FFD700';
                    this.ctx.lineWidth = 3;
                    this.ctx.shadowColor = '#FF8A00';
                    this.ctx.shadowBlur = 20;
                } else {
                    this.ctx.strokeStyle = '#FF2A4B';
                    this.ctx.lineWidth = 2;
                }

                this.ctx.beginPath();
                if (this.ctx.roundRect) {
                    this.ctx.roundRect(wordX - pillW / 2, wordY - 36, pillW, pillH, 8);
                } else {
                    this.ctx.rect(wordX - pillW / 2, wordY - 36, pillW, pillH);
                }
                this.ctx.fill();
                this.ctx.stroke();

                // Jutsu Banner over word
                if (this.isJutsuActive) {
                    this.ctx.font = 'bold 12px "Space Grotesk", sans-serif';
                    this.ctx.fillStyle = '#FFD700';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText('⚡ SPECIAL CHAKRA JUTSU MOVE ⚡', wordX, wordY - 44);
                }

                let currentDrawX = wordX - metrics.width / 2;
                this.ctx.textAlign = 'left';
                this.ctx.font = 'bold 34px "Space Grotesk", sans-serif';

                for (let i = 0; i < this.activeWord.length; i++) {
                    const char = this.activeWord.charAt(i);
                    const charW = this.ctx.measureText(char).width;

                    if (i < this.typedIndex) {
                        this.ctx.fillStyle = '#42E88A';
                    } else if (i === this.typedIndex) {
                        this.ctx.fillStyle = this.isJutsuActive ? '#FFD700' : '#FF2A4B';
                    } else {
                        this.ctx.fillStyle = '#8C99AB';
                    }

                    this.ctx.fillText(char, currentDrawX, wordY);
                    currentDrawX += charW;
                }

                this.ctx.restore();
            }

            this.fx.draw(this.ctx);
            this.ctx.restore();
        }
    }

    window.addEventListener('DOMContentLoaded', () => {
        window.rishuGame = new RishuKeyJutsuGame();
    });

})();
