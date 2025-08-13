import type { Point, TranslocatorsGeojson } from "./types";
import * as QT from "./quadtree";

export type BuildGraphConfig = {
  translocatorWeight: number,
  queryExpansionStartDist: number,
  enableQuadTreeQueryExpansion: boolean,
}

export type SearchConfig = {
  from: Point,
  to: Point,
}

class Graph {
  edges: number[][]
  weights: number[][]

  constructor(capacity?: number) {
    this.edges = [];
    this.weights = [];
    if (capacity) {
      this.edges = Array.from({length: capacity});
      this.weights = Array.from({length: capacity});
    }
  }

  addEdge(from: number, to: number, weight: number) {
    if (!this.edges[from]) {
      this.edges[from] = []
      this.weights[from] = []
    }
    this.edges[from].push(to)
    this.weights[from].push(weight)
  }

  dijkstraPath(from: number, to: number): number[] {
    const distances: number[] = []
    const previous: (number | null)[] = [];
    const queue: number[] = [];

    for (let i = 0; i < this.edges.length; i++) {
      distances[i] = Infinity;
      previous[i] = null;
      queue.push(i);
    }
    distances[from] = 0;

    while (queue.length) {
      let u: number = -1;
      let queuePosition: number = -1;

      {
        let minDist = Infinity;
        for (let i = 0; i < queue.length; i++) {
          const vertex = queue[i]
          if (distances[vertex] < minDist) {
            minDist = distances[vertex];
            u = vertex;
            queuePosition = i;
          }
        }
        queue.splice(queuePosition, 1);

        for (let i = 0; i < this.edges[u].length; i++) {
          const alt = distances[u] + this.weights[u][i];
          const v = this.edges[u][i]
          if (alt < distances[v]) {
            distances[v] = alt;
            previous[v] = u;
          }
        }
      }
    }

    const path: number[] = [];
    let u: number | null = to;
    if (previous[u] || u === from) {
      while (u) {
        path.push(u);
        u = previous[u]
      }
    }

    return path.reverse();
  }

  * dijkstraPathGenerator(from: number, to: number): Generator<number, number[], void> {
    const distances: number[] = []
    const previous: (number | null)[] = [];
    const queue: number[] = [];

    for (let i = 0; i < this.edges.length; i++) {
      distances[i] = Infinity;
      previous[i] = null;
      queue.push(i);
    }
    distances[from] = 0;

    while (queue.length) {
      let u: number = -1;
      let queuePosition: number = -1;

      {
        let minDist = Infinity;
        for (let i = 0; i < queue.length; i++) {
          const vertex = queue[i]
          if (distances[vertex] < minDist) {
            minDist = distances[vertex];
            u = vertex;
            queuePosition = i;
          }
        }
        queue.splice(queuePosition, 1);

        for (let i = 0; i < this.edges[u].length; i++) {
          const alt = distances[u] + this.weights[u][i];
          const v = this.edges[u][i]
          if (alt < distances[v]) {
            distances[v] = alt;
            previous[v] = u;
          }
        }
      }

      if (queue.length % 1000 === 0) {
        yield (1 - queue.length / this.edges.length) * 100;
      }
    }

    const path: number[] = [];
    let u: number | null = to;
    if (previous[u] || u === from) {
      while (u) {
        path.push(u);
        u = previous[u]
      }
    }

    return path.reverse();
  }
}

function getDistance(point1: Point, point2: Point) {
  return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2));
  // Manhattan distance. Can make sense sometimes because of the road infrastructure
  // return Math.abs(point1[0] - point2[0]) + Math.abs(point1[1] - point2[1]);
}


function *buildGraph(nodes: Point[], quadTree: QT.QuadTree, config: BuildGraphConfig = {
  translocatorWeight: 0,
  enableQuadTreeQueryExpansion: true,
  queryExpansionStartDist: 2000
}) {
  const graph = new Graph(nodes.length);
  const translocatorWeight = config.translocatorWeight;
  const queryExpansionStartDist = config.queryExpansionStartDist;
  for (let i = 0; i < nodes.length; i++) {
    if (i % 1000 === 0) {
      yield i / nodes.length * 100;
    }
    if (i % 2 === 0) {
      graph.addEdge(i, i + 1, translocatorWeight);
      graph.addEdge(i + 1, i, translocatorWeight);
    }

    let closePoints = quadTree.queryRange(new QT.AABB([nodes[i][0] - queryExpansionStartDist, nodes[i][1] - queryExpansionStartDist], queryExpansionStartDist * 2));
    if (config.enableQuadTreeQueryExpansion && closePoints.length < 10) {
      closePoints = quadTree.queryRange(new QT.AABB([nodes[i][0] - queryExpansionStartDist, nodes[i][1] - queryExpansionStartDist], queryExpansionStartDist * 10));
    }
    if (config.enableQuadTreeQueryExpansion && closePoints.length < 10) {
      closePoints = quadTree.queryRange(new QT.AABB([nodes[i][0] - queryExpansionStartDist, nodes[i][1] - queryExpansionStartDist], queryExpansionStartDist * 100));
    }
    if (config.enableQuadTreeQueryExpansion && closePoints.length < 10) {
      closePoints = quadTree.queryRange(new QT.AABB([nodes[i][0] - queryExpansionStartDist, nodes[i][1] - queryExpansionStartDist], queryExpansionStartDist * 1000));
    }
    for (let j = 0; j < closePoints.length; j++) {
      const id = closePoints[j][1];
      if (id === i) {
        continue;
      }
      const point = closePoints[j];
      const dist = getDistance(nodes[i], point[0]);
      graph.addEdge(i, id, dist);
      graph.addEdge(id, i, dist);
    }
  }
  return graph;
}

async function *findPath(geojson: TranslocatorsGeojson, config: BuildGraphConfig & SearchConfig): AsyncGenerator<string|number, Point[], void> {
  const tlPairList = geojson["features"];
  const nodes: Point[] = [];
  const quadTree = new QT.QuadTree(new QT.AABB([-1000000, -1000000], 2000000));

  yield "Building node list";
  for (let i = 0; i < tlPairList.length; i++) {
    const pair = tlPairList[i];
    nodes.push(pair.geometry.coordinates[0]);
    nodes.push(pair.geometry.coordinates[1]);
    quadTree.insert(pair.geometry.coordinates[0], i * 2);
    quadTree.insert(pair.geometry.coordinates[1], i * 2 + 1);
    if (i % 1000 === 0) {
      yield i / tlPairList.length * 100;
    }
  }

  const graphGenerator = buildGraph(nodes, quadTree, config);
  let next;
  yield "Building graph";
  while (!(next = graphGenerator.next()).done) {
    yield next.value;
  }
  const graph = next.value;

  const startNodeId = nodes.length;
  nodes.push(config.from);
  quadTree.insert(config.from, startNodeId);
  for (let i = 0; i < nodes.length - 1; i++) {
    const dist = getDistance(nodes[i], config.from);
    graph.addEdge(i, startNodeId, dist)
    graph.addEdge(startNodeId, i, dist)
  }
  const stopNodeId = nodes.length;
  quadTree.insert(config.to, stopNodeId);
  nodes.push(config.to);
  for (let i = 0; i < nodes.length - 1; i++) {
    const dist = getDistance(nodes[i], config.to);
    graph.addEdge(i, stopNodeId, dist)
    graph.addEdge(stopNodeId, i, dist)
  }

  function areLinked(node1: number, node2: number) {
    if (node1 === startNodeId || node1 === stopNodeId || node2 === startNodeId || node2 === stopNodeId) {
      return false;
    }
    return Math.abs(node1 - node2) === 1 && Math.min(node1, node2) % 2 === 0;
  }

  // const path = graph.dijkstraPath(startNodeId, stopNodeId);
  const pathGenerator = graph.dijkstraPathGenerator(startNodeId, stopNodeId);
  yield "Finding path";
  while (!(next = pathGenerator.next()).done) {
    yield next.value;
  }

  const path: number[] = next.value;

  // When using incomplete graph algorithm may choose to walk you through several close nodes
  // without teleporting. If that's the case, we should reduce path.
  const MASK_PASSTHROUGH = 0;
  const MASK_NORMAL = 1;
  const teleportMask = [MASK_NORMAL, MASK_NORMAL];
  for (let i = 2; i < path.length - 1; i++) {
    const node = path[i];
    const previousNode = path[i - 1];
    if (areLinked(node, previousNode)) {
      teleportMask[i - 1] = MASK_NORMAL
      teleportMask[i] = MASK_NORMAL
    } else {
      teleportMask[i] = MASK_PASSTHROUGH;
    }
  }
  for (let i = teleportMask.length - 1; i > 0; i--) {
    if (teleportMask[i] === MASK_PASSTHROUGH) {
      path.splice(i, 1);
    }
  }

  return path.map((value) => nodes[value]);
}

export { findPath };
