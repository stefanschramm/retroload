import {AtariCasAdapter} from './formats/ataricas.js';
import {AtariGenericAdapter} from './formats/generic/atari.js';
import {C64GenericAdapter} from './formats/generic/c64.js';
import {C64P00Adapter} from './formats/c64p00.js';
import {C64PrgAdapter} from './formats/c64prg.js';
import {C64T64Adapter} from './formats/c64t64.js';
import {C64TapAdapter} from './formats/c64tap.js';
import {CpcCdtAdapter} from './formats/cpccdt.js';
import {CpcGenericAdapter} from './formats/generic/cpc.js';
import {KcKccAdapter} from './formats/kckcc.js';
import {KcSssAdapter} from './formats/kcsss.js';
import {KcTapAdapter} from './formats/kctap.js';
import {Lc80GenericAdapter} from './formats/generic/lc80.js';
import {MsxCasAdapter} from './formats/msxcas.js';
import {TaGenericAdapter} from './formats/generic/ta.js';
import {Z1013GenericAdapter} from './formats/generic/z1013.js';
import {Z1013Z80Adapter} from './formats/z1013z80.js';
import {Zx81PAdapter} from './formats/zx81p.js';
import {ZxSpectrumTapAdapter} from './formats/zxspectrumtap.js';
import {ZxSpectrumTzxAdapter} from './formats/zxspectrumtzx.js';

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
  Z1013Z80Adapter,
  Zx81PAdapter,
  ZxSpectrumTapAdapter,
  ZxSpectrumTzxAdapter,
];
