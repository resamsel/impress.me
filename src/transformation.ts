import {Translation} from './translation';
import {Scale} from './scale';
import {Rotation} from './rotation';

export interface Transformation extends Translation, Rotation, Scale {
}
