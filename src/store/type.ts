
export interface ActiveNode {
  id: string;
  kind: string;
  parentId?: string;
  grantId?: string;
}
export interface Processor {
  processorId: string;
  kind: string;
  properties: object;
  processors?: Processor[];
  output: string;
}

export interface Transformer {
  transformId: string;
  processorId: string;
  properties: any;
  output: any;
}

export interface FlowOut {
  routeId: string;
  properties: any;
  transforms: Transformer[];
  processors: Processor[];
  externalDataSource: any[];
}

export interface Group {
  name: string;
  description: string;
  icon?: string;
  processorType?: string;
  processorMetaVOList?: Group[];
}

export interface SpContext {
  userId: number | string;
  appId: number;
  nodeId: string;
  componentId: number;
}

export interface State {
  spContext?: SpContext;
  flowOut: FlowOut;
  componentInfo: any;
  nodeGroup: Group[];
  nodeGroupLoading: boolean;
  graphJson?: any;
}