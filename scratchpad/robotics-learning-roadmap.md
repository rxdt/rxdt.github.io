# Robotics Learning Roadmap

*Built for a strong Python/ML/backend engineer moving into vision-guided
manipulation (the litter-bot). Ordered by what you'll hit first, with the
"what's different from what you already know" called out explicitly. All links
verified.*

---

## 0. How to read this
You already own the hard parts most beginners lack: Python, ML/CV (YOLO), git,
data, systems thinking. What's genuinely *new* is a thin but unfamiliar layer —
geometry (frames/transforms), real-time control loops, calibration, and hardware.
**Learn it just-in-time against the build, not all up front.**

---

## 1. The mindset shift — what's different from web/ML
- **Sense → plan → act loop, not request/response.** A robot runs a continuous
  perception → decision → action loop at a fixed rate and holds physical state;
  it's not a stateless handler.
- **Coordinate frames & transforms — the single biggest new concept.** Everything
  lives in a frame (world, arm base, camera, gripper, object) and you constantly
  convert between them with rotations (quaternions / rotation matrices /
  homogeneous transforms). Most beginner bugs are frame bugs.
  - [REP-105: coordinate frames](https://reps.openrobotics.org/rep-0105/)
  - [The four types of robot frames (plain English)](https://pattiengineering.com/blog/coordinate-system-frames-industrial-robots)
- **Real-time & language split.** Hard real-time / low-level control is C++ (and C
  on microcontrollers); high-level perception/logic — your v1 — is fine in Python.
  Know where the boundary is.
  - [Software-engineer → robotics guide](https://www.automate.org/robotics/blogs/guide-to-become-robotics-software-engineer)
  - [Why software engineers should embrace robotics](https://levidoro.medium.com/why-software-engineers-should-embrace-robotics-in-ai-era-4763aaf70795)
- **Noise, calibration, no ground truth.** Sensors are noisy, nothing is exact,
  and you *calibrate* (camera intrinsics, hand-eye) instead of assuming clean
  inputs.
- **Hardware/embedded reality.** Serial/USB, GPIO, motor drivers, microcontrollers
  (Arduino / micro-ROS), power. A bug here moves a physical arm — **safety is a
  first-class concern.**
- **Sim-to-real gap.** Code that works in simulation faceplants on real
  friction/latency. Budget for it.

---

## 2. Core concepts + where to learn each
- **Rigid-body transforms & rotations** → Modern Robotics Ch.2–3; Peter Corke
  Robot Academy (§3).
- **Forward & inverse kinematics** (joint angles ↔ tool position) → Modern
  Robotics Ch.4–6; hands-on with [`ikpy`](https://github.com/Phylliade/ikpy).
- **Closed-loop control / PID** → Modern Robotics Ch.11; Robot Academy control videos.
- **Camera models, intrinsic + hand-eye calibration** →
  [OpenCV calibration tutorial](https://docs.opencv.org/4.x/dc/dbb/tutorial_py_calibration.html)
  + `cv2.calibrateHandEye`; [worked ROS2 hand-eye repo](https://github.com/lixiny/Handeye-Calibration-ROS).
- **Motion planning & trajectories** →
  [PythonRobotics](https://github.com/AtsushiSakai/PythonRobotics) (code-first); MoveIt for arms.
- **State estimation / Kalman filters** (later) → PythonRobotics.

---

## 3. Canonical courses & books (free-first)
- **Modern Robotics — Lynch & Park.** The standard rigorous foundation. Free book
  PDF + [YouTube lectures + wiki](https://hades.mech.northwestern.edu/index.php/Modern_Robotics)
  + [Coursera specialization](https://www.coursera.org/specializations/modernrobotics).
  *Start here for theory.*
- **Peter Corke — Robot Academy.**
  [200+ free ~10-min videos](https://petercorke.com/resources/robot-academy/) +
  the *Robotics, Vision & Control* book. More applied, vision-heavy — lighter math.
- **PythonRobotics — Atsushi Sakai.**
  [Readable Python implementations](https://github.com/AtsushiSakai/PythonRobotics)
  of core algorithms. *Perfect for a coder who learns by reading code.*
- **OpenAI Spinning Up** — [deep RL](https://spinningup.openai.com/) (later;
  relevant to legged/learned control, not your v1).
- **Sutton & Barto — Reinforcement Learning** —
  [the free RL bible](http://incompleteideas.net/book/the-book-2nd.html) (later).

---

## 4. Your build path: vision-guided manipulation (do these against the litter-bot)
- **Arm control + IK** → [`ikpy`](https://github.com/Phylliade/ikpy),
  [Hugging Face LeRobot](https://github.com/huggingface/lerobot) (SO-101 native).
- **Simulate first** → [PyBullet](https://pybullet.org/) (easiest Python entry —
  load a URDF, move an arm) → [MuJoCo](https://mujoco.org/) later.
- **Detection fine-tuning** → [Ultralytics YOLO](https://docs.ultralytics.com/) +
  [Roboflow labeling/training](https://blog.roboflow.com/yolo-training/).
- **Imitation learning (optional v2)** →
  [LeRobot ACT](https://huggingface.co/docs/lerobot/en/act) — teleoperate demos,
  train a policy.

---

## 5. The ROS 2 question (honest)
Your litter-bot **v1 doesn't need ROS 2** (plain Python + the arm SDK). But learn
the *concepts* — the field and most jobs speak it. When ready:
[official ROS 2 docs/tutorials](https://docs.ros.org/) and
[The Construct](https://www.theconstruct.ai/) (interactive, browser-based).
**Skip ROS 1 — it's end-of-life.** For arm planning: [MoveIt 2](https://moveit.ai/).

---

## 6. Broader / next (after the litter-bot)
- **Mobile robots & navigation:** SLAM + [Nav2](https://docs.nav2.org/).
- **Learned control / legged:** [Isaac Lab](https://isaac-sim.github.io/IsaacLab/) + Spinning Up.
- **3D perception:** [Open3D](https://www.open3d.org/), point clouds (pairs with your depth camera).

---

## 7. Hardware & electronics starter
Servos vs steppers vs DC motors, motor drivers, microcontrollers, power, serial.
The [Arduino learning hub](https://docs.arduino.cc/learn/) is the gentlest
on-ramp; you'll mostly need "drive a servo over serial from Python," which is small.

---

## 8. Communities
[ROS Discourse](https://discourse.ros.org/) ·
[r/robotics](https://www.reddit.com/r/robotics/) ·
the Hugging Face LeRobot community · Ultralytics forums.

---

## Suggested first five moves (just-in-time)
1. **Modern Robotics Ch.2–3 + Corke's frame videos** → get the vocabulary of transforms.
2. **`ikpy` + PyBullet** → move a simulated arm to a target.
3. **OpenCV intrinsic + hand-eye calibration** → connect camera coords to arm coords.
4. **Ultralytics YOLO fine-tune** → detect your target.
5. **Wire 2–4 into the closed-loop pick-and-place** (Phase 3 of `litterbot-build-spec.md`).
