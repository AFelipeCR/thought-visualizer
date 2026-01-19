# @afelipecr/thought-visualizer

A universal Web Component to render note graphs. It allows you to visualize connections between data based on `[[WikiLinks]]` and Frontmatter tags.

---

## Installation

This project uses the **"Build-on-Install"** approach, meaning it compiles the source code on your machine when you install it via GitHub.

```bash
npm install https://github.com/AFelipeCR/thought-visualizer

```

*This will automatically trigger the `prepare` script and build the library inside your `node_modules` folder.*

---

## Basic Usage

Since it is a **Custom Element**, you can use it in any framework or with vanilla HTML/JavaScript.

### 1. Import the library

In your main JavaScript/TypeScript file:

```javascript
import '@afelipecr/thought-visualizer';

```

### 2. Add the component to your HTML

```html
<thought-visualizer id="vis"></thought-visualizer>

```

### 3. Provide the data

The component expects an array of objects representing your Markdown notes through the `vault` property:

```javascript
const visualizer = document.getElementById('vis');

visualizer.vault = [
  { 
    name: 'Main Idea.md', 
    content: '---\ntags: [core]\n---\nThis connects to [[Concept B]].' 
  },
  { 
    name: 'Concept B.md', 
    content: 'Depends on [[Main Idea]].' 
  }
];

```

---

## Configuration

### Graph Styles (`graphStyle`)

You can customize node colors based on their Frontmatter tags:

```javascript
visualizer.graphStyle = {
  tagColors: {
    web: "#4a57c5",
    technology: "#63c54a",
    core: "#c44a54"
  }
};

```

### Event Listeners (`onClickListeners`)

Define custom behaviors when a node is clicked:

```javascript
visualizer.onClickListeners = {
  "Main Idea": (node, event) => {
    console.log("Clicked on Main Idea node", node);
  }
};

```

---

## Local Development

To contribute or test the project locally:

1. **Install dependencies:**
```bash
npm install

```


2. **Start development server:**
```bash
npm run dev

```


3. **Build the library:**
```bash
npm run build

```

---

## Built With

This project is made possible by these awesome open-source libraries:

### Core Engines (Runtime)
* **[force-graph](https://github.com/vasturiano/force-graph)**: Responsible for the 2D visualization engine.
* **[js-yaml](https://github.com/nodeca/js-yaml)**: Used for parsing Frontmatter metadata from notes.

### Development Tools
* **[TypeScript](https://www.typescriptlang.org/)**: For static type checking and better developer experience.
* **[Vite](https://vitejs.dev/)**: As the build tool and development server.

---

## License

This project is licensed under the **MIT License**. See the `LICENSE` file for more details.

**Author:** [AFelipeCR](https://github.com/AFelipeCR).

---