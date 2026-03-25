# Low-Fidelity Prototyping & Technical Sketches (CG Project A)

This is the foundational design work for the **Computer Graphics** (Computação Gráfica) course at LEIC, Instituto Superior Técnico (2023/2024). **Project A** focused on the conceptual and structural planning of 3D scenes before programmatic implementation.

## Project Overview

The goal of this phase was to bridge the gap between a conceptual idea and a technical 3D scene. This was achieved through low-fidelity prototyping, manual technical sketching, and the formal definition of the scene's hierarchical structure.

### Key Learning Objectives
1.  **Spatial Planning**: Conceptualizing a 3D environment and its components (e.g., a room with a table, chairs, and lamps).
2.  **Orthographic Projection**: Drafting technical sketches from multiple viewpoints (Top, Front, and Side) to define dimensions and relative positions.
3.  **Scene Graph Theory**: Designing the **Hierarchical Structure** (Parent-Child relationships) to ensure that object transformations propagate logically.
4.  **Interface Design**: Planning the user interaction and camera placement strategy.



---

## Technical Documentation

### 1. Technical Sketches
Manual drawings were produced to define the exact geometry of each object in the scene. These sketches served as the blueprint for the subsequent Three.js implementation, ensuring that all coordinates and scales were predefined.
* **Top View ($XZ$ plane)**: Used for layout and floor positioning.
* **Front View ($XY$ plane)**: Used for height and vertical alignment.
* **Side View ($ZY$ plane)**: Used for depth verification.

### 2. Hierarchical Structure (Scene Graph)
A formal hierarchy was established to manage complex objects. By nesting meshes within groups, we ensured that:
* Moving a "Table" automatically moves all its "Legs."
* Rotating a "Crane Jib" automatically rotates the "Trolley" attached to it.
* Scaling a parent object affects all its descendants proportionally.
