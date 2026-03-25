# Interactive Scene: Mathematical Carousel (CG Project C)

This is the implementation of **Project C** for the **Computer Graphics** (Computação Gráfica) course at LEIC, Instituto Superior Técnico (2023/2024). The project focuses on 3D modeling, advanced lighting, materials, and stereoscopic camera systems using **Three.js**.

## Project Overview

The objective of this project is to create an interactive 3D scene featuring a "Mathematical Carousel." The project explores geometric modeling through parametric surfaces and implements realistic lighting and texture mapping.

### Key Learning Objectives
1.  **Geometric Modeling**: Creating complex meshes using parametric surfaces (e.g., ruled surfaces) and specific structures like the **Möbius strip**.
2.  **Lighting & Materials**: Implementing directional lights and spotlights, along with varied material properties (Phong/Lambert).
3.  **Textures**: Applying textures to geometric meshes to enhance visual realism.
4.  **Stereoscopic Vision**: Implementing a stereoscopic camera system to simulate 3D depth perception.



---

## Technical Implementation

The project is built as a web application using the **Three.js** library and follows a standard interactive graphics architecture.

* **Language**: JavaScript (ES6+)
* **Framework**: [Three.js](https://threejs.org/)
* **Frontend**: HTML5 / CSS3
* **Animation Pattern**: **Update-Display Cycle**.
    * **Update Phase**: Handles physics, object transformations ($pos = pos + vel \cdot dt$), and collision detection.
    * **Display Phase**: Manages buffer clearing, projection/visualization matrix settings, and scene rendering.



---

## Features & Controls

* **Interactive Carousel**: A mobile structure featuring different parametric surfaces as "seats."
* **Dynamic Lighting**: Toggleable light sources including ambient, directional, and localized spotlights.
* **Stereoscopic Toggle**: Switch between a standard perspective camera and a stereoscopic view for 3D glasses.
* **Responsive Design**: The application implements window resizing events to maintain aspect ratio and rendering scale.
