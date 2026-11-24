"""Generates every sound in the game from code (no samples, no licences): sound effects and
background music loops. Run with:  npm run audio     (needs python3 + numpy + scipy + ffmpeg)

Each sound is written to public/assets/audio/<name>.ogg and .mp3. To replace one with your own
recording, drop a file with the same name in that folder (and do not re-run this for it).
Edit the patterns below to change the music; run `npm run audio -- title` to rebuild one.
"""
import subprocess, sys, tempfile, os
import numpy as np
from scipy.io import wavfile

SR = 22050
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets', 'audio')
os.makedirs(OUT, exist_ok=True)

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
MINOR = [0, 3, 5, 7, 10]
MAJOR = [0, 2, 4, 7, 9]

def t_of(dur): return np.arange(int(SR * dur)) / SR
def env_exp(t, k): return np.exp(-t * k)

def pluck(freq, dur=0.9, vol=0.5):
    """A kalimba / kora-like plucked note."""
    t = t_of(dur)
    s = (np.sin(2 * np.pi * freq * t) * env_exp(t, 4.5)
         + 0.35 * np.sin(2 * np.pi * freq * 2.01 * t) * env_exp(t, 8)
         + 0.12 * np.sin(2 * np.pi * freq * 3.98 * t) * env_exp(t, 14))
    s *= np.minimum(1, t / 0.004)
    return s * vol

def bell(freq, dur=1.2, vol=0.4):
    t = t_of(dur)
    s = (np.sin(2 * np.pi * freq * t) + 0.5 * np.sin(2 * np.pi * freq * 2.76 * t) * env_exp(t, 3)
         + 0.25 * np.sin(2 * np.pi * freq * 5.4 * t) * env_exp(t, 6)) * env_exp(t, 3.2)
    return s * np.minimum(1, t / 0.003) * vol

def pad(freqs, dur, vol=0.12):
    t = t_of(dur)
    s = sum(np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2 * t) for f in freqs) / len(freqs)
    a = np.minimum(1, t / (dur * 0.25)) * np.minimum(1, (dur - t) / (dur * 0.25))
    return s * a * vol

def bass(freq, dur=0.5, vol=0.5):
    t = t_of(dur)
    s = np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(2 * np.pi * freq * 2 * t)
    return s * env_exp(t, 5) * np.minimum(1, t / 0.01) * vol

def thump(freq=90, dur=0.35, vol=0.8):
    t = t_of(dur)
    f = freq * (1 + 1.6 * env_exp(t, 30))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(t, 11) * vol

def noise_burst(dur=0.08, lo=0.0, vol=0.4, k=40, seed=1):
    rng = np.random.default_rng(seed)
    n = rng.standard_normal(int(SR * dur))
    if lo > 0:  # crude high-pass / low-pass by smoothing
        n = n - np.convolve(n, np.ones(int(lo)) / int(lo), mode='same')
    t = t_of(dur)
    return n * env_exp(t, k) * vol

def slap(vol=0.45, seed=2):  # djembe slap
    return noise_burst(0.1, lo=6, vol=vol, k=34, seed=seed) + 0.4 * pluck(310, 0.1, vol)

def shaker(vol=0.18, seed=3): return noise_burst(0.07, lo=4, vol=vol, k=60, seed=seed)

def chirp(f0, f1, dur=0.12, vol=0.2):
    t = t_of(dur)
    f = np.linspace(f0, f1, len(t))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / dur) * vol

class Track:
    """A looping buffer: sounds that ring past the end wrap round to the start, so it loops cleanly."""
    def __init__(self, bpm, bars, beats=4):
        self.bpm, self.bars, self.beats = bpm, bars, beats
        self.beat = 60.0 / bpm
        self.n = int(round(SR * self.beat * beats * bars))
        self.buf = np.zeros(self.n)
    def at(self, beat, sig):
        i = int(round(beat * self.beat * SR)) % self.n
        idx = (i + np.arange(len(sig))) % self.n
        np.add.at(self.buf, idx, sig)
    def out(self): return self.buf

def melody(rng, root, scale, steps, density=0.55, lo=0, hi=2, start=None):
    """Random walk on a pentatonic scale: mostly small steps, so it sounds like a tune."""
    degrees = [root + 12 * o + d for o in range(lo, hi) for d in scale]
    tonic = min(len(scale), len(degrees) - 1)
    pos = start if start is not None else tonic
    notes = []
    for s in range(steps):
        if rng.random() < density:
            pos = int(np.clip(pos + rng.choice([-2, -1, -1, 0, 1, 1, 2]), 0, len(degrees) - 1))
            notes.append((s, degrees[pos]))
    notes.append((0, degrees[tonic]))  # always start on the tonic
    return notes

def finish(buf, peak=0.85):
    m = np.max(np.abs(buf)) or 1
    return (buf / m * peak).astype(np.float32)

# --------------------------------------------------------------------------------- music
def music_title():
    rng = np.random.default_rng(1); T = Track(72, 8); root = 57
    for bar, off in enumerate([0, -4, 3, -2] * 2):
        T.at(bar * 4, pad([hz(root + off), hz(root + off + 7), hz(root + off + 12)], T.beat * 4.4))
        T.at(bar * 4, bass(hz(root + off - 12), T.beat * 3, 0.45))
    for s, m in melody(rng, root + 12, MINOR, 64, 0.5):
        T.at(s * 0.5, pluck(hz(m), 1.2, 0.35))
    return T.out()

def music_courtyard():
    rng = np.random.default_rng(2); T = Track(92, 8); root = 62
    for b in range(8):
        T.at(b * 4, bass(hz(root - 24 + [0, 5, 7, 5][b % 4]), T.beat * 1.5, 0.45))
        T.at(b * 4 + 2, bass(hz(root - 24 + [0, 5, 7, 5][b % 4] + 7), T.beat * 1.2, 0.35))
        T.at(b * 4, thump(85, 0.3, 0.6)); T.at(b * 4 + 2, thump(85, 0.3, 0.5))
        for k in (1, 3): T.at(b * 4 + k, slap(0.3, seed=k + b))
        T.at(b * 4 + 1.5, slap(0.18, seed=40 + b)); T.at(b * 4 + 3.5, slap(0.18, seed=50 + b))
    for s, m in melody(rng, root, MAJOR, 64, 0.6):
        T.at(s * 0.5, pluck(hz(m), 0.9, 0.35))
    return T.out()

def music_wall_garden():
    rng = np.random.default_rng(3); T = Track(70, 8); root = 55
    for bar, off in enumerate([0, 5, 0, 7] * 2):
        T.at(bar * 4, pad([hz(root + off), hz(root + off + 4), hz(root + off + 7)], T.beat * 4.4, 0.1))
        for i, d in enumerate([0, 4, 7, 12, 7, 4, 9, 4]):  # a rolling kora-like arpeggio
            T.at(bar * 4 + i * 0.5, pluck(hz(root + 12 + off + d), 1.0, 0.22))
    for s, m in melody(rng, root + 24, MAJOR, 64, 0.2, 0, 1):
        T.at(s * 0.5, bell(hz(m), 1.4, 0.2))
    return T.out()

def music_road():
    rng = np.random.default_rng(4); T = Track(100, 8); root = 52
    for b in range(8):
        for k in range(4):
            T.at(b * 4 + k, bass(hz(root - 12 + [0, 3, 5, 3][k]), T.beat * 0.9, 0.4))
        for k in range(8): T.at(b * 4 + k * 0.5, shaker(0.16 if k % 2 else 0.24, seed=k))
        T.at(b * 4, thump(75, 0.3, 0.5)); T.at(b * 4 + 2, thump(75, 0.3, 0.4))
    for s, m in melody(rng, root + 12, MINOR, 64, 0.55):
        T.at(s * 0.5, pluck(hz(m), 0.9, 0.35))
    return T.out()

def music_forest():
    rng = np.random.default_rng(5); T = Track(60, 8); root = 50
    for bar in range(0, 8, 2):
        T.at(bar * 4, pad([hz(root - 12), hz(root - 5), hz(root)], T.beat * 8.6, 0.14))
    for s, m in melody(rng, root + 12, MINOR, 64, 0.22, 0, 2):
        T.at(s * 0.5, pluck(hz(m), 1.6, 0.3))
    for _ in range(14):  # birds
        b = rng.random() * 32; f = 2200 + rng.random() * 1800
        for k in range(int(rng.integers(2, 4))): T.at(b + k * 0.16, chirp(f, f * (1.1 + 0.2 * rng.random()), 0.1, 0.07))
    return T.out()

def music_kirina():
    rng = np.random.default_rng(6); T = Track(104, 8); root = 50
    for bar in range(0, 8, 2):
        T.at(bar * 4, pad([hz(root - 12), hz(root - 5), hz(root + 3 - 12)], T.beat * 8.6, 0.14))
    for b in range(8):
        for k, v in enumerate([0.9, 0, 0.5, 0.6, 0.9, 0, 0.5, 0.3]):
            if v: T.at(b * 4 + k * 0.5, thump(70 + 12 * (k % 3), 0.35, v * 0.8))
        T.at(b * 4 + 3.5, slap(0.3, seed=b))
    for s, m in melody(rng, root + 12, MINOR, 64, 0.3, 0, 2):
        T.at(s * 0.5, pluck(hz(m), 1.0, 0.3))
    return T.out()

def music_big_tree():
    rng = np.random.default_rng(7); T = Track(66, 8); root = 60
    for bar, off in enumerate([0, 5, 7, 0] * 2):
        T.at(bar * 4, pad([hz(root + off - 12), hz(root + off - 5), hz(root + off)], T.beat * 4.4, 0.12))
        T.at(bar * 4, bass(hz(root + off - 24), T.beat * 3, 0.4))
    for s, m in melody(rng, root + 12, MAJOR, 64, 0.45):
        T.at(s * 0.5, bell(hz(m), 1.3, 0.25)); T.at(s * 0.5, pluck(hz(m), 0.8, 0.2))
    return T.out()

def music_runner():
    rng = np.random.default_rng(8); T = Track(140, 8); root = 57
    for b in range(8):
        for k in range(8):
            T.at(b * 4 + k * 0.5, bass(hz(root - 24 + [0, 0, 7, 0, 5, 5, 7, 3][k]), T.beat * 0.45, 0.4))
            T.at(b * 4 + k * 0.5, shaker(0.14 if k % 2 else 0.22, seed=k))
        T.at(b * 4, thump(80, 0.3, 0.7)); T.at(b * 4 + 2, thump(80, 0.3, 0.6)); T.at(b * 4 + 2.5, thump(80, 0.25, 0.4))
        for k in (1, 3): T.at(b * 4 + k, slap(0.35, seed=k))
    for s, m in melody(rng, root + 12, MINOR, 64, 0.75):
        T.at(s * 0.5, pluck(hz(m), 0.5, 0.35))
    return T.out()

# ------------------------------------------------------------------------------------ sfx
def seq(*parts):
    n = max(int((o + len(p) / SR) * SR) for o, p in parts) + 1
    b = np.zeros(n)
    for o, p in parts:
        i = int(o * SR); b[i:i + len(p)] += p
    return b

def sfx_click(): return pluck(900, 0.06, 0.5)
def sfx_talk(): return seq((0, pluck(hz(72), 0.25, 0.4)), (0.09, pluck(hz(76), 0.3, 0.4)))
def sfx_choose(): return seq((0, pluck(hz(76), 0.2, 0.45)), (0.07, pluck(hz(83), 0.35, 0.45)))
def sfx_codex(): return seq(*[(i * 0.09, bell(hz(m), 0.9, 0.35)) for i, m in enumerate([72, 76, 79, 84])])
def sfx_save(): return seq((0, bell(hz(79), 0.6, 0.35)), (0.12, bell(hz(86), 0.8, 0.3)))
def sfx_error(): return seq((0, bass(160, 0.25, 0.8)), (0.16, bass(120, 0.35, 0.8)))
def sfx_footstep(): return noise_burst(0.07, lo=18, vol=0.7, k=45, seed=9)
def sfx_jump():
    return chirp(300, 760, 0.14, 0.5)
def sfx_double(): return seq((0, chirp(500, 1100, 0.12, 0.45)), (0.05, bell(hz(88), 0.25, 0.2)))
def sfx_crash(): return seq((0, noise_burst(0.25, lo=8, vol=0.9, k=14, seed=5)), (0, thump(110, 0.35, 0.9)))
def sfx_arrive(): return seq(*[(i * 0.11, pluck(hz(m), 0.8, 0.45)) for i, m in enumerate([67, 71, 74, 79, 83])])
def sfx_collect(): return seq((0, bell(hz(88), 0.25, 0.35)), (0.06, bell(hz(95), 0.35, 0.3)))
def sfx_blip(): return pluck(1400, 0.03, 0.18)

def music_complete():
    return seq(*[(i * 0.22, pluck(hz(m), 1.4, 0.5)) for i, m in enumerate([57, 60, 64, 69, 72, 76])],
               (1.3, pad([hz(57), hz(64), hz(69)], 3.0, 0.3)))

TRACKS = {
    'title-theme': music_title, 'courtyard-loop': music_courtyard, 'wall-garden-loop': music_wall_garden,
    'road-loop': music_road, 'forest-loop': music_forest, 'kirina-loop': music_kirina,
    'big-tree-loop': music_big_tree, 'runner-loop': music_runner, 'trail-complete': music_complete,
    'click': sfx_click, 'talk': sfx_talk, 'choose': sfx_choose, 'codex-unlock': sfx_codex, 'save': sfx_save,
    'error': sfx_error, 'footstep': sfx_footstep, 'jump': sfx_jump, 'double-jump': sfx_double,
    'crash': sfx_crash, 'arrive': sfx_arrive, 'collect': sfx_collect, 'text-blip': sfx_blip,
}
MUSIC = {n for n in TRACKS if n.endswith('-loop') or n in ('title-theme', 'trail-complete')}

def write(name, buf):
    buf = finish(buf, 0.8 if name in MUSIC else 0.9)
    with tempfile.TemporaryDirectory() as d:
        wav = os.path.join(d, name + '.wav')
        wavfile.write(wav, SR, buf)
        kbps = '40k' if name in MUSIC else '48k'
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-c:a', 'libvorbis', '-b:a', kbps, os.path.join(OUT, name + '.ogg')], check=True)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-c:a', 'libmp3lame', '-b:a', '48k', os.path.join(OUT, name + '.mp3')], check=True)
    print('  wrote', name, f'({len(buf) / SR:.1f}s)')

if __name__ == '__main__':
    only = sys.argv[1] if len(sys.argv) > 1 else ''
    for name, fn in TRACKS.items():
        if only in name: write(name, fn())
    print('Done.')
