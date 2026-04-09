import React from "react";
import ForceGraph2D from "react-force-graph-2d";

function GraphView({ notes }) {
  // 🔥 convert notes → graph
  const nodes = notes.map((note) => ({
    id: note.id,
    name: note.text,
    tags: note.tags || [],
  }));

  const links = [];

  // 🔥 connect notes with common tags
  for (let i = 0; i < notes.length; i++) {
    for (let j = i + 1; j < notes.length; j++) {
      const tags1 = notes[i].tags || [];
      const tags2 = notes[j].tags || [];

      const hasCommonTag = tags1.some((tag) =>
        tags2.includes(tag)
      );

      if (hasCommonTag) {
        links.push({
          source: notes[i].id,
          target: notes[j].id,
        });
      }
    }
  }

  const graphData = { nodes, links };

  return (
    <div className="h-[500px] bg-transparent rounded-xl mt-6">
  <ForceGraph2D
    graphData={graphData}
    
    nodeLabel="name"
    
    nodeCanvasObject={(node, ctx, globalScale) => {
      const label = node.name;
      const fontSize = 12 / globalScale;
      ctx.font = `${fontSize}px Sans-Serif`;
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillText(label, node.x + 8, node.y + 3);
    }}

    linkColor={() => "#ff4d4f"}

    d3Force="charge"
    d3VelocityDecay={0.3}

    cooldownTicks={100}
  />
</div>
  );
}

export default GraphView;