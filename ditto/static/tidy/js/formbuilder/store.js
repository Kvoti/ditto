// Calling this a store but not quite sure what it is
import { ManagedObject } from '../lib/schema/schema';
import * as formSchema from './schema';

export default new ManagedObject(formSchema.form);
