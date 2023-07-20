import type {AbstractAdapter} from './adapter/AbstractAdapter.js';
import {AtariCasAdapter} from './adapter/AtariCasAdapter.js';
import {AtariGenericAdapter} from './adapter/AtariGenericAdapter.js';
import {C64GenericAdapter} from './adapter/C64GenericAdapter.js';
import {C64P00Adapter} from './adapter/C64P00Adapter.js';
import {C64PrgAdapter} from './adapter/C64PrgAdapter.js';
import {C64T64Adapter} from './adapter/C64T64Adapter.js';
import {C64TapAdapter} from './adapter/C64TapAdapter.js';
import {CpcCdtAdapter} from './adapter/CpcCdtAdapter.js';
import {CpcGenericAdapter} from './adapter/CpcGenericAdapter.js';
import {ElectronGenericAdapter} from './adapter/ElectronGenericAdapter.js';
import {ElectronUefAdapter} from './adapter/ElectronUefAdapter.js';
import {KcBasicGenericAdapter} from './adapter/KcBasicGenericAdapter.js';
import {KcGenericAdapter} from './adapter/KcGenericAdapter.js';
import {KcKccAdapter} from './adapter/KcKccAdapter.js';
import {KcSssAdapter} from './adapter/KcSssAdapter.js';
import {KcTapAdapter} from './adapter/KcTapAdapter.js';
import {Lc80GenericAdapter} from './adapter/Lc80GenericAdapter.js';
import {Mo5GenericAdapter} from './adapter/Mo5GenericAdapter.js';
import {Mo5K7Adapter} from './adapter/Mo5K7Adapter.js';
import {MsxCasAdapter} from './adapter/MsxCasAdapter.js';
import {TaGenericAdapter} from './adapter/TaGenericAdapter.js';
import {TiFiadAdapter} from './adapter/TiFiadAdapter.js';
import {TiGenericAdapter} from './adapter/TiGenericAdapter.js';
import {TiTitapeAdapter} from './adapter/TiTitapeAdapter.js';
import {Z1013GenericAdapter} from './adapter/Z1013GenericAdapter.js';
import {Z1013Z13Adapter} from './adapter/Z1013Z13Adapter.js';
import {Z1013Z80Adapter} from './adapter/Z1013Z80Adapter.js';
import {Zx81PAdapter} from './adapter/Zx81PAdapter.js';
import {ZxSpectrumTapAdapter} from './adapter/ZxSpectrumTapAdapter.js';
import {ZxSpectrumTzxAdapter} from './adapter/ZxSpectrumTzxAdapter.js';

export const adapters: Array<typeof AbstractAdapter> = [
  AtariCasAdapter,
  AtariGenericAdapter,
  C64GenericAdapter,
  C64P00Adapter,
  C64PrgAdapter,
  C64T64Adapter,
  C64TapAdapter,
  CpcCdtAdapter,
  CpcGenericAdapter,
  ElectronGenericAdapter,
  ElectronUefAdapter,
  KcBasicGenericAdapter,
  KcGenericAdapter,
  KcKccAdapter,
  KcSssAdapter,
  KcTapAdapter,
  Lc80GenericAdapter,
  Mo5GenericAdapter,
  Mo5K7Adapter,
  MsxCasAdapter,
  TaGenericAdapter,
  TiFiadAdapter,
  TiGenericAdapter,
  TiTitapeAdapter,
  Z1013GenericAdapter,
  Z1013Z13Adapter,
  Z1013Z80Adapter,
  Zx81PAdapter,
  ZxSpectrumTapAdapter,
  ZxSpectrumTzxAdapter,
];
