import { Entity, property } from '@loopback/repository';

export class ModelBlueprint extends Entity {
  @property({
    type: 'string',
    id: true,
    mongodb: { dataType: 'ObjectID' },
  })
  id: string;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  created: Date;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  edited: Date;
}
