import {AtariCasAdapter} from './adapters/ataricas.js';
import {AtariGenericAdapter} from './adapters/atarigeneric.js';
import {C64GenericAdapter} from './adapters/c64generic.js';
import {C64P00Adapter} from './adapters/c64p00.js';
import {C64PrgAdapter} from './adapters/c64prg.js';
import {C64T64Adapter} from './adapters/c64t64.js';
import {C64TapAdapter} from './adapters/c64tap.js';
import {CpcCdtAdapter} from './adapters/cpccdt.js';
import {CpcGenericAdapter} from './adapters/cpcgeneric.js';
import {KcKccAdapter} from './adapters/kckcc.js';
import {KcSssAdapter} from './adapters/kcsss.js';
import {KcTapAdapter} from './adapters/kctap.js';
import {Lc80GenericAdapter} from './adapters/lc80generic.js';
import {MsxCasAdapter} from './adapters/msxcas.js';
import {TaGenericAdapter} from './adapters/tageneric.js';
import {Z1013GenericAdapter} from './adapters/z1013generic.js';
import {Z1013Z13Adapter} from './adapters/z1013z13.js';
import {Z1013Z80Adapter} from './adapters/z1013z80.js';
import {Zx81PAdapter} from './adapters/zx81p.js';
import {ZxSpectrumTapAdapter} from './adapters/zxspectrumtap.js';
import {ZxSpectrumTzxAdapter} from './adapters/zxspectrumtzx.js';

export const adapters = [
  AtariCasAdapter,
  AtariGenericAdapter,
  C64GenericAdapter,
  C64P00Adapter,
  C64PrgAdapter,
  C64T64Adapter,
  C64TapAdapter,
  CpcCdtAdapter,
  CpcGenericAdapter,
  KcKccAdapter,
  KcSssAdapter,
  KcTapAdapter,
  Lc80GenericAdapter,
  MsxCasAdapter,
  TaGenericAdapter,
  Z1013GenericAdapter,
  Z1013Z13Adapter,
  Z1013Z80Adapter,
  Zx81PAdapter,
  ZxSpectrumTapAdapter,
  ZxSpectrumTzxAdapter,
];
