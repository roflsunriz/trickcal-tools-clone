export type MaterialId = string;
export type StageName = string;

export type SweepMaterial = {
  rank: number;
  stages: StageName[];
};

export type SweepData = Record<MaterialId, SweepMaterial>;

export type AlternativeStage = {
  stage: StageName;
  materials: MaterialId[];
  blueprints: MaterialId[];
};
