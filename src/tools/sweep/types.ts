export type MaterialName = string;
export type StageName = string;

export type SweepMaterial = {
  rank: number;
  stages: StageName[];
};

export type SweepData = Record<MaterialName, SweepMaterial>;

export type AlternativeStage = {
  stage: StageName;
  materials: MaterialName[];
  blueprints: MaterialName[];
};
