"use client";

import {useEffect,useRef,useState} from "react";

type Props={
  id:string;
  title?:string;
  allowDrawing?:boolean;
};

const MAX_SIDE=1600;
const MAX_FILE_MB=10;

function storageKey(id:string,suffix:string){return `mars-planner-attachment:${id}:${suffix}`}

async function resizeImage(file:File):Promise<string>{
  if(file.size>MAX_FILE_MB*1024*1024)throw new Error(`Файл больше ${MAX_FILE_MB} МБ`);
  const src=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error("Не удалось прочитать файл"));reader.readAsDataURL(file)});
  const image=await new Promise<HTMLImageElement>((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error("Не удалось открыть изображение"));img.src=src});
  const scale=Math.min(1,MAX_SIDE/Math.max(image.width,image.height));
  const canvas=document.createElement("canvas");
  canvas.width=Math.max(1,Math.round(image.width*scale));
  canvas.height=Math.max(1,Math.round(image.height*scale));
  const ctx=canvas.getContext("2d");
  if(!ctx)throw new Error("Не удалось обработать изображение");
  ctx.drawImage(image,0,0,canvas.width,canvas.height);
  return canvas.toDataURL("image/jpeg",0.86);
}

export default function PlannerAttachment({id,title="Фото, изображение или рисунок",allowDrawing=true}:Props){
  const[image,setImage]=useState("");
  const[caption,setCaption]=useState("");
  const[error,setError]=useState("");
  const[drawingOpen,setDrawingOpen]=useState(false);
  const[dragging,setDragging]=useState(false);
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const drawingRef=useRef(false);

  useEffect(()=>{
    setImage(localStorage.getItem(storageKey(id,"image"))||"");
    setCaption(localStorage.getItem(storageKey(id,"caption"))||"");
  },[id]);

  const saveImage=(value:string)=>{
    setImage(value);
    if(value)localStorage.setItem(storageKey(id,"image"),value);else localStorage.removeItem(storageKey(id,"image"));
  };

  const onFile=async(file?:File)=>{
    if(!file)return;
    setError("");
    if(!/^image\/(jpeg|png|webp)$/i.test(file.type)){setError("Можно загрузить JPG, PNG или WebP");return}
    try{saveImage(await resizeImage(file))}catch(e){setError(e instanceof Error?e.message:"Не удалось загрузить изображение")}
  };

  const onDrop=(event:React.DragEvent<HTMLElement>)=>{
    event.preventDefault();
    setDragging(false);
    void onFile(event.dataTransfer.files?.[0]);
  };

  useEffect(()=>{
    if(!drawingOpen)return;
    const canvas=canvasRef.current;if(!canvas)return;
    const ratio=Math.max(1,window.devicePixelRatio||1);
    const rect=canvas.getBoundingClientRect();
    canvas.width=Math.round(rect.width*ratio);canvas.height=Math.round(rect.height*ratio);
    const ctx=canvas.getContext("2d");if(!ctx)return;
    ctx.scale(ratio,ratio);ctx.lineWidth=3;ctx.lineCap="round";ctx.lineJoin="round";ctx.strokeStyle="#2b2432";ctx.fillStyle="#fffdf8";ctx.fillRect(0,0,rect.width,rect.height);
  },[drawingOpen]);

  const point=(e:React.PointerEvent<HTMLCanvasElement>)=>{const rect=e.currentTarget.getBoundingClientRect();return{x:e.clientX-rect.left,y:e.clientY-rect.top}};
  const start=(e:React.PointerEvent<HTMLCanvasElement>)=>{drawingRef.current=true;e.currentTarget.setPointerCapture(e.pointerId);const ctx=e.currentTarget.getContext("2d");const p=point(e);ctx?.beginPath();ctx?.moveTo(p.x,p.y)};
  const move=(e:React.PointerEvent<HTMLCanvasElement>)=>{if(!drawingRef.current)return;const ctx=e.currentTarget.getContext("2d");const p=point(e);ctx?.lineTo(p.x,p.y);ctx?.stroke()};
  const end=()=>{drawingRef.current=false};
  const clearDrawing=()=>{const canvas=canvasRef.current;if(!canvas)return;const ctx=canvas.getContext("2d");if(!ctx)return;ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle="#fffdf8";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.restore()};
  const saveDrawing=()=>{const canvas=canvasRef.current;if(!canvas)return;saveImage(canvas.toDataURL("image/png"));setDrawingOpen(false)};

  return <section className={`plannerAttachment${dragging?" isDragging":""}`} data-pdf-attachment="true" onDragEnter={e=>{e.preventDefault();setDragging(true)}} onDragOver={e=>e.preventDefault()} onDragLeave={e=>{if(e.currentTarget===e.target)setDragging(false)}} onDrop={onDrop}>
    <div className="attachmentHead"><div><b>{title}</b><small>Изображение и подпись будут включены в будущий PDF-экспорт.</small></div></div>
    {!image?<div className="attachmentEmpty">
      <label className="attachmentButton">＋ Добавить фото или изображение<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>onFile(e.target.files?.[0])}/></label>
      {allowDrawing&&<button type="button" className="attachmentSecondary" onClick={()=>setDrawingOpen(true)}>✎ Нарисовать</button>}
      <small>JPG, PNG или WebP, до {MAX_FILE_MB} МБ. На компьютере файл можно перетащить сюда.</small>
    </div>:<div className="attachmentPreview">
      <img src={image} alt={caption||"Вложение ученика"}/>
      <div className="attachmentActions"><label>Заменить<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>onFile(e.target.files?.[0])}/></label>{allowDrawing&&<button type="button" onClick={()=>setDrawingOpen(true)}>Нарисовать заново</button>}<button type="button" onClick={()=>saveImage("")}>Удалить</button></div>
    </div>}
    {dragging&&<div className="attachmentDropHint">Отпусти файл, чтобы добавить изображение</div>}
    {error&&<p className="attachmentError">{error}</p>}
    <label className="attachmentCaption"><span>Подпись или комментарий</span><textarea rows={2} value={caption} onChange={e=>{setCaption(e.target.value);localStorage.setItem(storageKey(id,"caption"),e.target.value)}}/></label>
    {drawingOpen&&<div className="drawingModal" role="dialog" aria-modal="true" aria-label="Рисунок"><div className="drawingBox"><div className="drawingTitle"><b>Нарисуй пальцем, мышкой или стилусом</b><button type="button" onClick={()=>setDrawingOpen(false)}>×</button></div><canvas ref={canvasRef} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end}/><div className="drawingActions"><button type="button" onClick={clearDrawing}>Очистить</button><button type="button" className="save" onClick={saveDrawing}>Сохранить рисунок</button></div></div></div>}
    <style jsx global>{`
      .plannerAttachment{position:relative;margin:10px 0;padding:12px;border:1px dashed #b9a9c9;border-radius:12px;background:#fbf8ff;break-inside:avoid;page-break-inside:avoid;transition:.18s ease}.plannerAttachment.isDragging{border-color:#6b34bd;background:#f2eaff;box-shadow:0 0 0 3px #7b46c826}.attachmentHead b{display:block;font:700 15px Georgia}.attachmentHead small{display:block;margin-top:3px;color:#746b7d;font-size:11px}.attachmentEmpty{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:10px}.attachmentButton,.attachmentSecondary,.attachmentActions label,.attachmentActions button{border:0;border-radius:10px;padding:9px 11px;background:#5b27b1;color:#fff;font:800 12px Inter;cursor:pointer}.attachmentSecondary{background:#eee7f8;color:#5727a8}.attachmentButton input,.attachmentActions input{display:none}.attachmentEmpty>small{color:#817788}.attachmentPreview{margin-top:10px}.attachmentPreview img{display:block;width:100%;max-height:360px;object-fit:contain;border-radius:9px;background:#eee8f2}.attachmentActions{display:flex;gap:7px;flex-wrap:wrap;margin-top:7px}.attachmentActions label,.attachmentActions button{background:#eee7f8;color:#5727a8}.attachmentActions button:last-child{background:#fff0ed;color:#b54832}.attachmentDropHint{position:absolute;inset:8px;z-index:3;display:grid;place-items:center;border:2px dashed #6b34bd;border-radius:10px;background:#f7f1fff2;color:#5523a5;font-weight:900;text-align:center;padding:18px;pointer-events:none}.attachmentCaption{display:grid;gap:5px;margin-top:9px}.attachmentCaption span{font:700 12px Georgia}.attachmentCaption textarea{width:100%;border:1px solid #d8cfdf;border-radius:8px;padding:8px;resize:vertical;background:#fff;font:13px/1.4 Inter}.attachmentError{margin:8px 0 0;color:#b33b2c;font-size:12px}.drawingModal{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:18px;background:#251b32aa}.drawingBox{width:min(900px,96vw);padding:14px;border-radius:18px;background:#fff;box-shadow:0 25px 80px #0005}.drawingTitle{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.drawingTitle button{width:34px;height:34px;border:0;border-radius:50%;font-size:24px}.drawingBox canvas{display:block;width:100%;height:min(58vh,520px);border:1px solid #cfc5d8;border-radius:10px;background:#fffdf8;touch-action:none}.drawingActions{display:flex;justify-content:flex-end;gap:8px;margin-top:10px}.drawingActions button{border:0;border-radius:10px;padding:10px 13px;font-weight:800}.drawingActions .save{background:#5b27b1;color:#fff}@media print{.attachmentEmpty,.attachmentActions,.drawingModal,.attachmentDropHint{display:none!important}.plannerAttachment{border-style:solid;background:#fff}.attachmentPreview img{max-height:420px}.attachmentCaption textarea{border:0;padding:0;overflow:visible}}
    `}</style>
  </section>;
}
