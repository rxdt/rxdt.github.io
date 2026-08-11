# Litter-Bot Build Spec

*A stationary, vision-guided robot built from off-the-shelf parts. Grounded in
five verification passes (manipulator hardware, perception stack, compute/
framework, scoop mechanism + prior art, and an adversarial feasibility review).
All claims are sourced at the bottom.*

---

## 0. TL;DR — the one decision

**Build a vision-guided pick-and-place robot with closed-loop verification. Make
"litter" the theme and the stretch goal — not the pass/fail bar.**

- **Deliverable:** detect a target → plan a grasp → execute → re-image to confirm
  it's gone → retry on failure. Demonstrated on easy, high-contrast targets so it
  works *every time* on camera.
- **Why not "just build a litter scooper":** the reliable way to clean a box
  barely uses your ML, and the ML-driven way is (a) mechanically the hard part
  you're least equipped for and (b) already a shipping product (Litter-Robot 5
  Pro's AI "WasteID"). See §1.
- **Cost to a working v1:** ~**$270** (arm + webcam + a GPU you already own).
- **Effort:** a working closed-loop demo in ~**4–6 weekends**; the real-litter
  stretch is months and optional.

---

## 1. The honest framing (why this scope)

The project splits into a scissors, and naming it up front saves you months:

- **The reliable way to clean a box barely uses your skills.** Every machine that
  works (Litter-Robot, PetSafe ScoopFree) moves the *whole bed slowly* and
  gravity-sifts — it never targets individual clumps, and it runs on a timer +
  presence sensor. No CV, no ML. [ScoopFree mechanism][scoopfree],
  [Litter-Robot how-it-works][lr-how].
- **The skill-showcasing way is the hard, bespoke part — and already a product.**
  A cheap arm dragging a scoop through resistant litter is exactly the sustained,
  side-loaded work hobby arms are *not* rated for ([SO-ARM100 suitability][soarm-spec]),
  and clumps *crumble when lifted* ([scoop mechanics][scoop-crumble]) — a
  purpose-built sift mechanism Whisker needed years and patents to get right.
  Meanwhile the [Litter-Robot 5 Pro][lr5] already ships dual-camera AI that tells
  urine from feces — your exact CV story, done, for ~$699.
- **Prior-art check = whitespace *and* warning.** Essentially nobody has built a
  DIY scooper for a *standard* box; open builds all default to custom
  rotating-drum boxes precisely because static-bed scooping is hard
  ([Hackster drum build][hackster-drum], [Hackaday litter tag][hackaday-litter]).

**Difficulty ranking (from the adversarial review): Mechanical ≫ Integration >
CV.** Your instinct picked litter *because* the CV is your strength — but the CV
is the easy 20% here. So we keep the CV + integration (your turf, employable) and
demote the mechanical scoop-through-litter to an optional stretch.

---

## 2. What you're building — two tracks

### Track A — the portfolio piece (do this)
**Vision-guided targeted pick-and-place with closed-loop verification**, on easy
targets (dyed foam "clumps," high-contrast objects on the litter surface). Proves
the employable skills: YOLO fine-tuning, hand-eye calibration, a
perception→action loop, LeRobot integration, a safety interlock. It runs reliably
on camera because you chose targets the hardware can actually handle. The cat and
the litter box are the *narrative wrapper*.

> The arm's biggest weakness — not enough force to drag a scoop through litter —
> **evaporates** here, because light foam targets don't fight back. The thing that
> made the arm wrong for real litter doesn't apply to the demo that shows your
> skills.

### Track B — the real-litter stretch (optional)
Swap easy targets for actual clumps. This is where the depth camera and the
detection tricks earn their place (§4), and where you accept the honest
false-negative risk. Present it as a *measured stretch segment* ("here's the hard
version, here's my recall on buried clumps"), not the demo's success bar.

### The appliance fork (only if you want a working product for yourself, not a portfolio piece)
If the goal were ever "reliably clean my box," the honest design is **not** an arm
— it's a **single-axis powered sift-rake gantry** copying the ScoopFree mechanism
+ Litter-Robot's slow-sift logic. It's a mechatronics build, redundant with a
~$160 product, and shows none of your ML. Documented in §5 (Phase 6) for
completeness; it is *not* the recommended path.

---

## 3. Bill of materials

### Track A — buildable v1 (~$270)

| Part | Pick | Price | Why / notes | Source |
|---|---|---|---|---|
| Arm | **SO-101 / SO-ARM101 kit** (Feetech STS3215 servos, 6-DOF, ~500 mm reach, ~500 g payload) | ~$220–240 kit (~$100 DIY, ~$499 assembled) | Native **Hugging Face LeRobot** integration — teleoperate, record demos, train a policy. 500 g payload is plenty for light targets. | [Seeed][so101-seeed], [specs][so101-specs] |
| Camera (v1) | Any decent USB webcam, mounted top-down | ~$30 | High-contrast targets + fixed geometry don't need depth yet | — |
| Compute | **Your existing desktop/laptop GPU**, arm over USB from the same Python process | $0 | Simplest, most debuggable; the robot is tethered and stationary anyway | [Pi5 vs Jetson][pi-jetson] |
| End-effector | 3D-printed scoop/gripper (SO-101 ships a gripper; printable sift-scoops exist) | ~$0–15 filament | Start with the stock gripper for foam targets | [The Litterator][litterator], [scoop w/ holes][scoop-holes] |
| Mount/frame | Aluminum extrusion or a rigid printed base over the box | ~$20–40 | Keep the arm base rigid and close to the target to shorten the moment arm | — |

**Track A total: ~$270** (assuming you own a GPU-capable machine).

### Track B — real-litter stretch add-ons

| Part | Pick | Price | Why | Source |
|---|---|---|---|---|
| Depth camera | **Orbbec Gemini 335** (top-down) | $264 | Depth height-map catches a fresh clump as a *mound* even when it's litter-colored; independent of color separation | [Orbbec][gemini335], [depth cam roundup][depth-roundup] |
| (alt) | Intel RealSense D435 | ~$314 | More battle-tested `pyrealsense2` SDK | [Intel][d435] |
| Litter | Low-dust, medium-grain clumping clay (Dr. Elsey's / Boxiecat) | ~$20 | Crystal/silica and ultra-fine clay clog sifts and dodge sensors | [failure modes][homerun] |

### Optional standalone-appliance compute
| Part | Pick | Price | Why |
|---|---|---|---|
| Edge board | NVIDIA Jetson Orin Nano Super Dev Kit | $249 | Only if you want an untethered box; runs YOLO at 100+ FPS with TensorRT. A Raspberry Pi 5 (~$120–175 in the 2026 RAM crunch) can drive the arm but is weak for real-time vision on CPU. |

### Considered and rejected (so you don't re-litigate it)

| Option | Why not |
|---|---|
| myCobot 280 / WLKATA Mirobot / Trossen WidowX-250 | 250 g payload — too weak even for foam once extended; toy/education grade |
| Dobot Magician V3 | 4-DOF, short reach, ~$1,500 |
| Annin AR4 (1.9 kg payload — *is* strong enough) | ~$2–3k and a heavy multi-week mechanical build — fights the "limited hardware experience" constraint |
| UFactory Lite 6 / xArm | Real cobots, but $1.2k–3.5k, 2–7× over budget |
| Stepper gantry (for Track A) | Overkill for light targets and abandons the LeRobot ecosystem that makes this a *resume* piece; it's the right tool only for the litter appliance in §2 |

---

## 4. Software stack (no ROS — plain Python)

For **one stationary arm + one camera**, ROS 2 is overhead; use plain Python +
the arm's SDK ([why][ros-vs-py], [ROS2 alternatives][ros-alt]).

| Layer | Tool | Notes | Source |
|---|---|---|---|
| Detection | **Ultralytics YOLO11** (start `YOLO11m`, drop to `n/s` for speed), fine-tuned on your own images | Fine-tuned YOLO beats zero-shot foundation models on a novel class at ~400–600 images | [Ultralytics][ultra], [YOLO vs SAM3][yolo-sam] |
| Camera I/O | OpenCV | capture + hand-eye homography | [OpenCV][opencv] |
| Labeling | Roboflow (fastest) / CVAT / Label Studio; use SAM2 for *assisted* labeling only | You'll build the dataset — no public cat-litter-clump set exists | [Roboflow][roboflow], [SAM2][sam2] |
| Inverse kinematics | **ikpy** (pure Python, no ROS) — or the SO-101 SDK's built-in IK | Avoid MoveIt 2 unless you need collision-aware planning | [ikpy][ikpy] |
| Arm control | Feetech / LeRobot bus API (SO-101); `pyserial` for generic serial | | [LeRobot][lerobot], [pyserial][pyserial] |
| (v2, optional) | **LeRobot ACT** imitation learning — teleoperate ~50 demos, train in ~10–30 min | Keep as a fallback if scripted grasping proves finicky; scripted classical control is more reliable + debuggable for v1 | [ACT docs][act], [ACT explainer][act-explain] |
| Sim (½ day) | PyBullet — load the arm URDF, verify IK reaches the whole box, check self-collision | Cheap geometry sanity before touching hardware | [PyBullet][pybullet] |

### The stationary superpowers (Track B detection)
Because the camera is fixed, you get two cues a mobile robot can't use, and they
directly attack the "buried, litter-colored clump" failure mode:
1. **Frame-differencing** vs the last "clean" frame — a new clump is a change
   region even when it's the same color as the litter.
2. **Depth height-map** — a fresh clump reads as a *mound anomaly*.
Fuse these with YOLO and bias the whole thing for **recall** (a wasted scoop is
cheap; a missed feces clump is a failure).

---

## 5. Order of operations

Rough sequencing; times assume solo evenings/weekends.

**Phase 0 — Geometry sanity (½ day).** PyBullet: load the SO-101 URDF, confirm IK
reaches every point over the box, no self-collision or wall hits.

**Phase 1 — Arm control + hand-eye calibration (1 weekend).** Drive the arm from
Python; calibrate camera pixels → arm coordinates so "click a pixel, the tip goes
there." This is the backbone; get it solid.

**Phase 2 — Perception (1–2 weekends).** Collect + label ~300–800 images of your
easy targets (Roboflow), fine-tune YOLO11, detect + localize reliably.

**Phase 3 — Closed-loop pick-and-place (1 weekend). ← the deliverable.**
detect → grasp → execute → **re-image to confirm gone** → retry on failure. This
is the employable core; make it run every time.

**Phase 4 — Safety + polish (1 weekend).** Interlock (never move while the cat/a
hand is present), a clean state machine, a README + a demo video. Ship it.

**Phase 5 — Real-litter stretch (optional, months).** Add the Gemini 335; build
the frame-diff + height-map fusion; label real clumps; measure and report feces
recall honestly. Expect a *detect → scoop → re-scan → re-detect* loop, not
one-shot perfection. Design the scoop as a low-drag tine-rake doing shallow
passes; keep the servo from ever stalling.

**Phase 6 — Appliance route (only if you want a working product, not a portfolio
piece).** Single-axis powered sift-rake gantry over a shallow standard box
(ScoopFree mechanism + Litter-Robot slow-sift logic). All motion hardware sealed
*above* the litter plane, belt-driven not exposed-leadscrew, stall/torque-limited,
wetted parts removable + washable (PETG/stainless, not PLA).

---

## 6. Risks & mitigations

| Risk | Severity | Mitigation | Source |
|---|---|---|---|
| Missed feces (false negative on buried, litter-colored clumps) | High (Track B) | Depth height-map + frame-differencing fusion; tune for recall not mAP; active-learning loop (every miss → training set) | [COD survey][cod], [YOLO camouflage][yolo-cam], [occluded FN][yolo-fn] |
| Arm too weak to drag a scoop through litter | High (Track B) | Track A sidesteps it entirely (light targets); for Track B use a low-drag tine-rake + shallow passes + short moment arm, or move to the gantry | [SO-ARM100 spec][soarm-spec] |
| Clumps crumble / cement to the pan | Medium (Track B) | Sift by gravity through a comb, don't grip; stall-detected torque-limited drive; accept some residue | [scoop mechanics][scoop-crumble], [failure modes][homerun] |
| Litter dust in gears/rails, ammonia corrosion | Medium (Track B) | Motion hardware sealed above the litter plane; removable washable wetted parts | [failure modes][homerun] |
| Scope creep (chasing "solve litter") | High | Ship Track A first; keep litter a labeled stretch | adversarial review |
| "Why not just buy a Litter-Robot?" | Framing | It's not a product — it's a *skills demo*; the cat is the story (see §7) | [LR5 Pro][lr5] |

---

## 7. The "why build it" story (portfolio framing)

Be honest that this is **not a product** — a $699 Litter-Robot already
auto-cleans, and the LR5 Pro already does the AI waste-ID. What you're shipping is
a **demonstration of vision-guided manipulation**: fine-tuning a detector on data
you built, hand-eye calibration, a closed perception→action loop with retry, a
real-world safety interlock, and LeRobot on real hardware. Those are the employable
FDE/robotics-adjacent skills. The cat is the hook that makes the demo memorable and
plays to your storytelling — "I built a robot that tidies up after my cat" gets the
click; the closed-loop verification loop gets the job. Keep the writeup about the
*loop*, and let the litter be the narrative wrapper.

---

## 8. Sources

**Manipulator / arms**
- [SO-101/SO-ARM101 kit — Seeed Studio][so101-seeed]
- [SO-101 specs + LeRobot setup — Robotics Center][so101-specs]
- [SO-ARM100 suitability ("not for heavy/continuous load")][soarm-spec]
- [CoreXY / gantry kit comparison][gantry]

**Perception**
- [Fine-tuned YOLO vs zero-shot foundation models (arXiv 2512.11884)][yolo-sam]
- [Ultralytics YOLO docs][ultra] · [Roboflow YOLO training][roboflow] · [SAM2 (assisted labeling)][sam2]
- [Camouflaged-object-detection survey][cod] · [YOLO on camouflage][yolo-cam] · [YOLO small/occluded false negatives][yolo-fn]
- [Orbbec Gemini 335][gemini335] · [RealSense D435][d435] · [Depth-camera roundup 2026][depth-roundup]

**Compute / framework**
- [Raspberry Pi 5 vs Jetson Orin Nano Super][pi-jetson]
- [ROS driver vs plain Python][ros-vs-py] · [When you don't need ROS 2][ros-alt]
- [LeRobot ACT docs][act] · [ACT explainer 2026][act-explain] · [ikpy][ikpy] · [pyserial][pyserial] · [PyBullet][pybullet] · [OpenCV][opencv] · [LeRobot][lerobot]

**Scoop mechanism / prior art**
- [PetSafe ScoopFree mechanism][scoopfree] · [Litter-Robot how-it-works][lr-how] · [LR4 parts/gear diagram][lr4-parts]
- [Printable sift-scoop "The Litterator"][litterator] · [Scoop w/ holes][scoop-holes] · [LittleArm 3D-printed arm][littlearm]
- [Hackster DIY rotating-drum box][hackster-drum] · [Hackaday litter-box tag][hackaday-litter] · [self-scooping-box patent][patent]
- [Scoop mechanics / clumps crumble][scoop-crumble] · [7 automatic-litter-box failure modes][homerun]

**Commercial baselines / differentiation**
- [Litter-Robot 5 Pro — AI dual-camera "WasteID"][lr5]

<!-- link refs -->
[scoopfree]: https://support.petsafe.net/articles/understanding-your-scoopfree-litter-box/
[lr-how]: https://www.litter-robot.com/how-it-works.html
[soarm-spec]: https://refft.com/en/TheRobotStudio_SO-ARM100.html
[scoop-crumble]: https://cats.com/best-cat-litter-scoop
[lr5]: https://www.whisker.com/litter-robot-5-pro
[hackster-drum]: https://www.hackster.io/silas_/self-cleaning-cat-litter-box-45c5c4
[hackaday-litter]: https://hackaday.com/tag/litter-box/
[so101-seeed]: https://www.seeedstudio.com/SO-ARM101-Low-Cost-AI-Arm-Kit-Pro-p-6427.html
[so101-specs]: https://www.roboticscenter.ai/hardware/so-101
[gantry]: https://sovol.eu/blogs/new/compare-diy-3d-printer-corexy-kits-for-hobbyists-guide
[yolo-sam]: https://arxiv.org/html/2512.11884v1
[ultra]: https://docs.ultralytics.com/
[roboflow]: https://blog.roboflow.com/yolo-training/
[sam2]: https://docs.ultralytics.com/models/sam-2/
[cod]: https://link.springer.com/content/pdf/10.1007/s00530-024-01478-7.pdf
[yolo-cam]: https://www.mdpi.com/2079-9292/12/20/4213
[yolo-fn]: https://www.mdpi.com/1424-8220/25/21/6703
[gemini335]: https://store.orbbec.com/products/gemini-335
[d435]: https://store.intelrealsense.com/buy-intel-realsense-depth-camera-d435.html
[depth-roundup]: https://www.roboticscenter.ai/blog/best-depth-cameras-robotics
[pi-jetson]: https://www.hackster.io/yahboomtechnology/raspberry-pi-5-vs-jetson-orin-nano-super-1494fe
[ros-vs-py]: https://answers.ros.org/question/367606/what-does-a-ros-driver-do-vs-python-library-for-robot-arm/
[ros-alt]: https://qrydium.com/blog/robotics/ros2-alternatives-in-robotics/
[act]: https://huggingface.co/docs/lerobot/en/act
[act-explain]: https://www.roboticscenter.ai/blog/act-policy-explained
[ikpy]: https://github.com/Phylliade/ikpy
[pyserial]: https://pyserial.readthedocs.io/
[pybullet]: https://pybullet.org/
[opencv]: https://opencv.org/
[lerobot]: https://github.com/huggingface/lerobot
[litterator]: https://www.printables.com/model/2648-the-litterator-cat-litter-scoop
[scoop-holes]: https://www.printables.com/model/1409474-litter-scooper-holes-and-no-holes-designs
[littlearm]: https://hackaday.io/project/27318-littlearm-2c-3d-printed-robot-arm
[lr4-parts]: https://elecschem.com/litter-robot-4-parts-diagram
[patent]: https://patents.justia.com/patent/7628118
[homerun]: https://homerunpet.com/blogs/pet-care-insights/7-automatic-litter-box-problems-how-to-fix-them
