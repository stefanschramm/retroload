import {Apple2GenericAdapter} from './adapter/apple2/Apple2GenericAdapter.js';
import {AtariCasAdapter} from './adapter/atari/AtariCasAdapter.js';
import {AtariGenericAdapter} from './adapter/atari/AtariGenericAdapter.js';
import {BasicodeAdapter} from './adapter/basicode/BasicodeAdapter.js';
import {C64GenericAdapter} from './adapter/c64/C64GenericAdapter.js';
import {C64P00Adapter} from './adapter/c64/C64P00Adapter.js';
import {C64PrgAdapter} from './adapter/c64/C64PrgAdapter.js';
import {C64T64Adapter} from './adapter/c64/C64T64Adapter.js';
import {C64TapAdapter} from './adapter/c64/C64TapAdapter.js';
import {CpcCdtAdapter} from './adapter/cpc/CpcCdtAdapter.js';
import {CpcGenericAdapter} from './adapter/cpc/CpcGenericAdapter.js';
import {CswAdapter} from './adapter/csw/CswAdapter.js';
import {ElectronGenericAdapter} from './adapter/electron/ElectronGenericAdapter.js';
import {ElectronUefAdapter} from './adapter/electron/ElectronUefAdapter.js';
import {type InternalAdapterDefinition} from './adapter/AdapterDefinition.js';
import {KcBasicGenericAdapter} from './adapter/kc/KcBasicGenericAdapter.js';
import {KcGenericAdapter} from './adapter/kc/KcGenericAdapter.js';
import {KcKccAdapter} from './adapter/kc/KcKccAdapter.js';
import {KcSssAdapter} from './adapter/kc/KcSssAdapter.js';
import {KcTapAdapter} from './adapter/kc/KcTapAdapter.js';
import {Lc80GenericAdapter} from './adapter/lc80/Lc80GenericAdapter.js';
import {Mo5GenericAdapter} from './adapter/mo5/Mo5GenericAdapter.js';
import {Mo5K7Adapter} from './adapter/mo5/Mo5K7Adapter.js';
import {MpfGenericAdapter} from './adapter/mpf/MpfGenericAdapter.js';
import {MsxCasAdapter} from './adapter/msx/MsxCasAdapter.js';
import {MsxGenericAdapter} from './adapter/msx/MsxGenericAdapter.js';
import {MsxTsxAdapter} from './adapter/msx/MsxTsxAdapter.js';
import {OricGenericAdapter} from './adapter/oric/OricGenericAdapter.js';
import {OricTapAdapter} from './adapter/oric/OricTapAdapter.js';
import {SharpMzGenericAdapter} from './adapter/sharpmz/SharpMzGenericAdapter.js';
import {SharpMzMzfAdapter} from './adapter/sharpmz/SharpMzMzfAdapter.js';
import {TaGenericAdapter} from './adapter/ta/TaGenericAdapter.js';
import {TiFiadAdapter} from './adapter/ti/TiFiadAdapter.js';
import {TiGenericAdapter} from './adapter/ti/TiGenericAdapter.js';
import {TiTifileAdapter} from './adapter/ti/TiTifileAdapter.js';
import {TiTitapeAdapter} from './adapter/ti/TiTitapeAdapter.js';
import {Z1013GenericAdapter} from './adapter/z1013/Z1013GenericAdapter.js';
import {Z1013Z13Adapter} from './adapter/z1013/Z1013Z13Adapter.js';
import {Z1013Z80Adapter} from './adapter/z1013/Z1013Z80Adapter.js';
import {Zx81PAdapter} from './adapter/zx81/Zx81PAdapter.js';
import {ZxSpectrumGenericAdapter} from './adapter/zxspectrum/ZxSpectrumGenericAdapter.js';
import {ZxSpectrumTapAdapter} from './adapter/zxspectrum/ZxSpectrumTapAdapter.js';
import {ZxSpectrumTzxAdapter} from './adapter/zxspectrum/ZxSpectrumTzxAdapter.js';

const adapters: InternalAdapterDefinition[] = [
  Apple2GenericAdapter,
  AtariCasAdapter,
  AtariGenericAdapter,
  BasicodeAdapter,
  C64GenericAdapter,
  C64P00Adapter,
  C64PrgAdapter,
  C64T64Adapter,
  C64TapAdapter,
  CpcCdtAdapter,
  CpcGenericAdapter,
  CswAdapter,
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
  MpfGenericAdapter,
  MsxCasAdapter,
  MsxGenericAdapter,
  MsxTsxAdapter,
  OricGenericAdapter,
  OricTapAdapter,
  SharpMzGenericAdapter,
  SharpMzMzfAdapter,
  TaGenericAdapter,
  TiFiadAdapter,
  TiGenericAdapter,
  TiTifileAdapter,
  TiTitapeAdapter,
  Z1013GenericAdapter,
  Z1013Z13Adapter,
  Z1013Z80Adapter,
  Zx81PAdapter,
  ZxSpectrumGenericAdapter,
  ZxSpectrumTapAdapter,
  ZxSpectrumTzxAdapter,
];
export default adapters;
