# Interactive Scene: Construction Crane (CG Project B)

This is the implementation of **Project B** for the **Computer Graphics** (Computação Gráfica) course at LEIC, Instituto Superior Técnico (2023/2024). The project centers on hierarchical 3D modeling, kinematics, and real-time interaction using **Three.js**.

## Project Overview

The objective of this assignment is to develop an interactive 3D simulation of a **Construction Crane**. The project emphasizes the relationship between different parts of a complex machine (hierarchical modeling) and the implementation of multiple viewing perspectives.

### Key Learning Objectives
1.  **Hierarchical Modeling**: Structuring the crane's components (base, tower, jib, trolley, and hook) so that movements propagate correctly through the assembly.
2.  **Interactive Controls**: Implementing real-time keyboard inputs to rotate the jib, move the trolley horizontally, and adjust the hook's height.
3.  **Collision Detection**: Implementing basic logic to allow the hook to pick up objects (cargo) and release them inside a container.
4.  **Camera Systems**: Developing and switching between multiple orthogonal and perspective cameras (e.g., top view, side view, front view, and a "hook-eye" view).



---

## Technical Implementation

The simulation is built using **Three.js** and follows a strictly defined update-display cycle to manage animations and interactions.

* **Language**: JavaScript (ES6+)
* **Engine**: [Three.js](https://threejs.org/)
* **Materials**: Focus on **Basic** and **Lambert/Phong** materials without textures to emphasize geometry and lighting.
* **Architecture**: 
    * **Hierarchical Tree**: Each part of the crane is a child of the previous component (e.g., Hook $\rightarrow$ Trolley $\rightarrow$ Jib $\rightarrow$ Tower).
    * **Update Loop**: Calculates current rotations and translations based on active key presses and elapsed time ($dt$).



---

## Features & Controls

* **Crane Movement**:
    * **Jib**: Left/Right rotation.
    * **Trolley**: Forward/Backward translation along the jib.
    * **Hook**: Up/Down vertical movement.
* **Cargo Interaction**: Ability to "attach" a cargo object to the hook when in proximity and "detach" it when positioned over the delivery container.
* **Camera Switching**:
    * **Keys 1-4**: Switch between Front, Side, Top (Orthographic), and Perspective views.
 * **Key 5**: Activate the moving camera attached to the crane's hook.
* **Wireframe Toggle**: Ability to view the underlying polygon meshes of the 3D models.
