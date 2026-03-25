# Computer Graphics Portfolio: Interactive 3D Scenes

This repository showcases three core projects developed for the **Computer Graphics** (Computação Gráfica) course at LEIC, Instituto Superior Técnico (2023/2024). Two of these projects are built using **JavaScript** and the **Three.js** engine, focusing on the fundamental principles of real-time 3D rendering and interaction.



---

## Project A: Prototyping & Technical Design
**Focus:** Low-Fidelity Design and Scene Hierarchy

Before writing any code, this project focused on the architectural planning of a 3D environment. It involved creating a blueprint for a scene that balances geometric complexity with logical structure.

### Key Features
* **Technical Sketches**: Manual drafting of orthographic projections (Top, Front, and Side views) to define precise coordinates and scales for all objects.
* **Scene Graph Design**: Establishing a formal **Hierarchical Structure**. This ensured that transformations (like moving a table) would correctly affect all child components (like the objects on top of it).
* **Interaction Planning**: Mapping out user controls and camera placements to ensure an intuitive 3D experience.

---

## Project B: Interactive Construction Crane
**Focus:** Hierarchical Modeling & Kinematics

This project involves the creation of a functional, articulated construction crane. The primary challenge was establishing a complex **Scene Graph** where transformations (rotations and translations) propagate through a parent-child hierarchy.

### Key Features
* **Hierarchical Structure**: Independent control of the jib (rotation), trolley (horizontal translation), and hook (vertical translation).
* **Object Interaction**: A collision detection system that allows the crane to "pick up" cargo and place it inside a designated container.
* **Multi-View System**: Users can toggle between 5 different cameras, including fixed orthographic views (Front, Side, Top) and a dynamic "Hook Camera."
* **Visuals**: Implementation using **Basic** and **Lambert/Phong** materials to emphasize form and mechanical movement without the use of textures.



---

## Project C: Mathematical Carousel
**Focus:** Parametric Surfaces, Lighting & Stereoscopy

The "Mathematical Carousel" project evolves the technical scope by introducing advanced geometric modeling and a sophisticated lighting model.

### Key Features
* **Parametric Modeling**: Implementation of complex geometries including **ruled surfaces** and a **Möbius strip** generated through mathematical functions.
* **Advanced Lighting**: A lighting environment featuring a combination of **Ambient**, **Directional**, and **Spotlight** sources to create depth and highlights.
* **Texture Mapping**: Integration of coordinate-mapped textures onto parametric meshes to enhance visual detail.
* **Stereoscopic Vision**: A specialized camera mode that renders the scene for 3D glasses, simulating binocular depth perception.
