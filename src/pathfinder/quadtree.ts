type Point = [number, number] | [number, number, number];

class AABB {
  start: Point;
  end: Point;
  center: Point;
  size: number;

  constructor(start: Point, endOrSize: Point | number) {
    this.start = start;
    if (typeof endOrSize === "number") {
      this.end = [start[0] + endOrSize, start[1] + endOrSize];
      this.size = endOrSize;
    } else {
      this.end = endOrSize;
      this.size = endOrSize[0] - start[0];
    }
    this.center = [(this.start[0] + this.end[0]) / 2, (this.start[1] + this.end[1]) / 2];
  }

  containsPoint(point: Point): boolean {
    return (
      point[0] >= this.start[0] &&
      point[0] < this.end[0] &&
      point[1] >= this.start[1] &&
      point[1] < this.end[1]
    );
  }

  intersectsAABB(other: AABB): boolean {
    return (
      this.start[0] <= other.end[0] &&
      this.end[0] >= other.start[0] &&
      this.start[1] <= other.end[1] &&
      this.end[1] >= other.start[1]
    );
  }

  toString(): string {
    return `AABB([[${this.start[0]}, ${this.start[1]}], [${this.end[0]}, ${this.end[1]}]])`;
  }
}

type QuadTreeSubtrees = {
  NW: QuadTree;
  NE: QuadTree;
  SW: QuadTree;
  SE: QuadTree;
};

class QuadTree {
  static readonly NODE_CAPACITY = 10;
  boundary: AABB;
  points: Point[] = [];
  ids: number[] = [];
  subtrees: QuadTreeSubtrees | null = null;

  constructor(boundary: AABB) {
    this.boundary = boundary;
  }

  private subdivide(): QuadTreeSubtrees {
    const topCenter: Point = [this.boundary.center[0], this.boundary.start[1]];
    const leftCenter: Point = [this.boundary.start[0], this.boundary.center[1]];
    const halfSize = this.boundary.size / 2;
    return {
      NW: new QuadTree(new AABB(this.boundary.start, halfSize)),
      NE: new QuadTree(new AABB(topCenter, halfSize)),
      SW: new QuadTree(new AABB(leftCenter, halfSize)),
      SE: new QuadTree(new AABB(this.boundary.center, halfSize)),
    };
  }

  getNodeCount(): number {
    return (
      this.points.length +
      (this.subtrees
        ? this.subtrees?.NE.getNodeCount() +
          this.subtrees?.NW.getNodeCount() +
          this.subtrees?.SE.getNodeCount() +
          this.subtrees?.SW.getNodeCount()
        : 0)
    );
  }

  insert(p: Point, id: number): boolean {
    if (!this.boundary.containsPoint(p)) return false;
    if (this.points.length < QuadTree.NODE_CAPACITY && this.subtrees === null) {
      this.points.push(p);
      this.ids.push(id);
      return true;
    }
    if (this.subtrees === null) {
      this.subtrees = this.subdivide();
      for (let i = 0; i < this.points.length; i++) {
        const pt = this.points[i];
        const ptId = this.ids[i];
        if (
          this.subtrees.NW.insert(pt, ptId) ||
          this.subtrees.NE.insert(pt, ptId) ||
          this.subtrees.SW.insert(pt, ptId) ||
          this.subtrees.SE.insert(pt, ptId)
        ) {
          this.points.splice(i, 1);
          this.ids.splice(i, 1);
          i--;
        }
      }
    }
    const _ok =
      this.subtrees.NW.insert(p, id) ||
      this.subtrees.NE.insert(p, id) ||
      this.subtrees.SW.insert(p, id) ||
      this.subtrees.SE.insert(p, id);
    return true;
  }

  queryRange(range: AABB): [Point, number][] {
    const result: [Point, number][] = [];
    if (!this.boundary.intersectsAABB(range)) return result;
    if (this.subtrees === null) {
      // for (const pt of this.points) {
      for (let i = 0; i < this.points.length; i++) {
        const pt = this.points[i];
        const id = this.ids[i];
        if (range.containsPoint(pt)) {
          result.push([pt, id]);
        }
      }
      return result;
    }
    result.push(...this.subtrees.NW.queryRange(range));
    result.push(...this.subtrees.NE.queryRange(range));
    result.push(...this.subtrees.SW.queryRange(range));
    result.push(...this.subtrees.SE.queryRange(range));
    return result;
  }

  toString(): string {
    const sb: string[] = [];
    const treeStack: Array<{ tree: QuadTree; indent: number }> = [];
    treeStack.push({ tree: this, indent: 0 });
    while (treeStack.length > 0) {
      const cur = treeStack.pop()!;
      const indent = "-".repeat(cur.indent);
      sb.push(`${indent}Tree ${cur.tree.boundary.toString()}`);
      for (const pt of cur.tree.points) {
        sb.push(`${indent}>Point[${pt[0]}, ${pt[1]}]`);
      }
      if (cur.tree.subtrees) {
        treeStack.push({ tree: cur.tree.subtrees.SE, indent: cur.indent + 1 });
        treeStack.push({ tree: cur.tree.subtrees.SW, indent: cur.indent + 1 });
        treeStack.push({ tree: cur.tree.subtrees.NE, indent: cur.indent + 1 });
        treeStack.push({ tree: cur.tree.subtrees.NW, indent: cur.indent + 1 });
      }
    }
    return sb.join("\n");
  }
}

export { type Point, AABB, QuadTree };
