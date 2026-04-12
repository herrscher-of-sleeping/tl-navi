export type Point = [number, number] | [number, number, number];

export type TralnslocatorPairFeature = {
  type: "Feature";
  properties: {
    depth1: number;
    depth2: number;
    label: string;
    tag: string;
  };
  geometry: {
    type: "LineString";
    coordinates: [Point, Point];
  };
};

export type TranslocatorsGeojson = {
  type: "FeatureCollection";
  name: "translocators";
  features: TralnslocatorPairFeature[];
};

export type LandmarkFeature = {
  type: "Feature";
  properties: {
    type: string;
    label: string;
    z: number;
  };
  geometry: {
    type: "Point";
    coordinates: Point;
  };
};

export type LandmarksGeojson = {
  type: "FeatureCollection";
  name: "landmarks";
  features: LandmarkFeature[];
};

export type Point3D = {
  x: number,
  y: number,
  z: number,
};

export type TranslocatorPatchOperationAdd =  { from: Point3D, to: Point3D, operation: "add" };
export type TranslocatorPatchOperationDelete =  { from: Point3D, operation: "delete" };

export type TranslocatorsPatch = (TranslocatorPatchOperationAdd|TranslocatorPatchOperationDelete)[];
