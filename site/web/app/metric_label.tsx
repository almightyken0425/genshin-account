'use client';
import {createContext,useContext} from 'react';
import {Heart,Sword,Shield,Sparkles,UserRound,TrendingUp,Star,Gem,Target,Crosshair,BatteryCharging,Snowflake,Droplets,Flame,Zap,Wind,Mountain,Leaf,PlusCircle,Flower2} from 'lucide-react';

const metrics:Partial<Record<string,{short:string,Icon:typeof Heart}>>={
 '角色等級':{short:'Lv.',Icon:UserRound},
 '武器等級':{short:'Lv.',Icon:Sword},
 '等級上限':{short:'上限',Icon:TrendingUp},
 '武器上限':{short:'上限',Icon:TrendingUp},
 '命之座':{short:'命座',Icon:Star},
 '有效詞條總數':{short:'有效',Icon:Flower2},
 '精煉階數':{short:'精煉',Icon:Gem},
 '強化等級':{short:'強化',Icon:TrendingUp},
 '生命值':{short:'生命',Icon:Heart},
 '攻擊力':{short:'攻擊',Icon:Sword},
 '基礎攻擊力':{short:'攻擊',Icon:Sword},
 '防禦力':{short:'防禦',Icon:Shield},
 '元素精通':{short:'精通',Icon:Sparkles},
 '暴擊率':{short:'暴率',Icon:Target},
 '暴擊傷害':{short:'暴傷',Icon:Crosshair},
 '元素充能效率':{short:'充能',Icon:BatteryCharging},
 '冰元素傷害加成':{short:'冰傷',Icon:Snowflake},
 '水元素傷害加成':{short:'水傷',Icon:Droplets},
 '火元素傷害加成':{short:'火傷',Icon:Flame},
 '雷元素傷害加成':{short:'雷傷',Icon:Zap},
 '風元素傷害加成':{short:'風傷',Icon:Wind},
 '岩元素傷害加成':{short:'岩傷',Icon:Mountain},
 '草元素傷害加成':{short:'草傷',Icon:Leaf},
 '物理傷害加成':{short:'物傷',Icon:Sword},
 '治療加成':{short:'治療',Icon:PlusCircle},
 '普通攻擊':{short:'普攻',Icon:Sword},
 '元素戰技':{short:'戰技',Icon:Sparkles},
 '元素爆發':{short:'爆發',Icon:Flame},
};
export const MetricDisplayContext=createContext(false);
export default function MetricLabel({label}:{label:string}){
 const full=useContext(MetricDisplayContext);
 const key=label.replace(/\s*\(%\)$/,'').replace('（基礎）','');
 const metric=metrics[key],Icon=metric?.Icon;
 return <span className="metric-label" title={label}><span className="sr-only">{label}</span>{Icon&&<Icon size={14} aria-hidden="true"/>}<span className={Icon&&!full?'sr-only':'metric-text'} aria-hidden="true">{key}</span></span>;
}
