import React, { useState, useEffect } from "react";
import { MapPin, Calendar, Clock, ChevronLeft, ZoomIn, ZoomOut, RotateCcw, ShoppingCart, Info, Check, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, AlertCircle, X, Loader2, Filter, Ticket } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout.jsx";
import { useCart } from "../../context/CartContext.jsx";
import CommentSection from "../../components/support_user/CommentsSection.jsx"; 

// api url db
const API_BASE = "http://localhost:5000/api";

export default function MatchDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cartItems, addToCart, removeFromCart } = useCart();

  // state
  const [match, setMatch] = useState(null);             
  const [ticketConfigs, setTicketConfigs] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [viewMode, setViewMode] = useState("stadium"); 
  const [selectedConfig, setSelectedConfig] = useState(null); 
  
  //trạng thái lưu các ghế đã bán
  const [occupiedSeats, setOccupiedSeats] = useState([]); 
  const [isLoadingSeats, setIsLoadingSeats] = useState(false);

  const [zoomLevel, setZoomLevel] = useState(1);
  const [showLimitModal, setShowLimitModal] = useState(false);
  
  const [zoneFilter, setZoneFilter] = useState(null); 

  // gọi db
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [resMatch, resConfigs] = await Promise.all([
            fetch(`${API_BASE}/matches/${id}`),
            fetch(`${API_BASE}/match-t-configs/match/${id}`)
        ]);

        if (!resMatch.ok) throw new Error("Không tìm thấy trận đấu");

        const matchData = await resMatch.json();
        setMatch(matchData);
        if (resConfigs.ok) {
            const configsData = await resConfigs.json();
            const mappedConfigs = configsData.map(c => {
                let group = "OTHER";
                const zName = c.zone_name.toUpperCase();
                if (zName.includes("KHÁN ĐÀI A")) {
                    if (zName.includes("VIP") || zName.includes("PLATINUM")) group = "A-VIP";
                    else if (zName.includes("TẦNG 2")) group = "A-T2";
                    else group = "A-T1";
                } else if (zName.includes("KHÁN ĐÀI B")) {
                    if (zName.includes("TẦNG 2")) group = "B-T2";
                    else group = "B-T1";
                } else if (zName.includes("KHÁN ĐÀI C")) {
                    group = "C";
                } else if (zName.includes("KHÁN ĐÀI D")) {
                    group = "D";
                }
                return {
                    id: c.id,                    
                    name: c.type_name,           
                    zoneName: c.zone_name,       
                    price: Number(c.price),      
                    color: c.color_code || "#3B82F6", 
                    quantity: c.quantity_allocated,
                    sold: c.quantity_sold || 0,
                    zoneGroup: group
                };
            });
            setTicketConfigs(mappedConfigs);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // db ghế đã bán
  useEffect(() => {
      const fetchOccupiedSeats = async () => {
          if (!selectedConfig) return;
          
          setIsLoadingSeats(true);
          try {
              const res = await fetch(`${API_BASE}/tickets/occupied/${selectedConfig.id}`);
              if (res.ok) {
                  const seats = await res.json();
                  setOccupiedSeats(seats); 
              }
          } catch (e) {
              console.error("Lỗi tải ghế:", e);
          } finally {
              setIsLoadingSeats(false);
          }
      };

      fetchOccupiedSeats();
  }, [selectedConfig]); 

  // check trạng thái bán
  const isMatchSelling = match?.status === 'SELLING';

  //dl khu trong sân
const zones = [
    { id: "A-T2-1", name: "A - Tầng 2", group: "A-T2", style: { top: "5%", left: "25%", width: "50%", height: "8%", bg: "bg-blue-600" } },
    { id: "A-VIP", name: "A - VIP/Platinum", group: "A-VIP", style: { top: "15%", left: "35%", width: "30%", height: "6%", bg: "bg-yellow-500" } },
    { id: "A-T1-L", name: "A - Tầng 1", group: "A-T1", style: { top: "15%", left: "15%", width: "18%", height: "8%", bg: "bg-orange-500" } },
    { id: "A-T1-R", name: "A - Tầng 1", group: "A-T1", style: { top: "15%", right: "15%", width: "18%", height: "8%", bg: "bg-orange-500" } },
    { id: "B-T2", name: "B - Tầng 2", group: "B-T2", style: { bottom: "5%", left: "25%", width: "50%", height: "8%", bg: "bg-blue-500" } },
    { id: "B-T1", name: "B - Tầng 1 (CĐV)", group: "B-T1", style: { bottom: "15%", left: "20%", width: "60%", height: "8%", bg: "bg-red-600" } },
    { id: "C-Stand", name: "Khán đài C & D", group: "C", style: { top: "30%", left: "5%", width: "8%", height: "40%", bg: "bg-purple-500" } }, 
    { id: "D-Stand", name: "Khán đài D & E", group: "D", style: { top: "30%", right: "5%", width: "8%", height: "40%", bg: "bg-purple-500" } }, 
  ];

  const getRowLabel = (index) => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return index < 26 ? alphabet[index] : alphabet[index % 26] + (Math.floor(index/26));
  };

  const handleMapZoneClick = (group) => {
    setZoneFilter(group); 
    setSelectedConfig(null); 
    setViewMode("stadium"); 
  };
  const handleClearFilter = () => {
    setZoneFilter(null);
    setSelectedConfig(null);
  };
  const handleConfigClick = (config) => {
    setSelectedConfig(config);
    setViewMode("zone");
    setZoomLevel(1);
  };
  const handleBackToStadium = () => setViewMode("stadium");
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 3.0)); 
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const handleSeatClick = (seatLabel) => {
    // check trận nếu kp trận đang bán thì chặn k cho đặt hay xem vé
    if (!isMatchSelling) return;
    if (!selectedConfig) return;
    const seatId = `${selectedConfig.id}-${seatLabel}`;
    const isSelected = cartItems.find((s) => s.id === seatId);

    if (isSelected) {
        removeFromCart(seatId);
    } else {
        if (cartItems.length >= 4) {
            setShowLimitModal(true);
            return;
        }
        addToCart([{ 
            id: seatId,                  
            matchId: match.id,
            matchName: `${match.home_team} vs ${match.away_team}`,
            matchTime: match.start_time,
            stadium: match.stadium_name,
            image: match.banner_url || match.home_logo,       
            configId: selectedConfig.id, 
            ticketName: selectedConfig.name,
            zoneName: selectedConfig.zoneName,
            price: selectedConfig.price,
            color: selectedConfig.color,
            seatNumber: seatLabel 
        }]);
    }
  };

  // render kiểu lưới ghế
  const renderSeats = () => {
    if (!selectedConfig) return null;
    const totalQuantity = selectedConfig.quantity;

    // cấu hình hiển thị điều chỉnh ghế dựa trên sl vé
    let seatsPerRow = 10;
    let seatSizeClass = "w-10 h-10 text-xs"; 
    let gapClass = "gap-3";

    if (totalQuantity > 1000) {
        seatsPerRow = 25;
        seatSizeClass = "w-5 h-5 text-[8px]";
        gapClass = "gap-1";
    } else if (totalQuantity > 500) {
        seatsPerRow = 20;
        seatSizeClass = "w-7 h-7 text-[10px]";
        gapClass = "gap-1.5";
    } else if (totalQuantity > 200) {
        seatsPerRow = 15;
        seatSizeClass = "w-8 h-8 text-[11px]";
        gapClass = "gap-2";
    }
    const displayCount = totalQuantity; 

    return (
        <div 
            className={`grid ${gapClass} p-4 bg-white border border-gray-200 rounded-xl shadow-sm inline-grid`}
            style={{ 
                gridTemplateColumns: `repeat(${seatsPerRow}, minmax(0, 1fr))` 
            }}>
            {Array.from({ length: displayCount }).map((_, idx) => {
                const rowIndex = Math.floor(idx / seatsPerRow); 
                const colIndex = (idx % seatsPerRow) + 1;       
                const rowLabel = getRowLabel(rowIndex);
                const seatLabel = `${rowLabel}${colIndex}`;
                const seatId = `${selectedConfig.id}-${seatLabel}`;
                
                const isSold = occupiedSeats.includes(seatLabel);
                const isSelected = cartItems.find(s => s.id === seatId);
                
                // CHECK: ngắt ghế nếu trận đấu không bán hoặc ghế đã bán
                const isDisabled = isSold || !isMatchSelling;

                return (
                    <button
                        key={seatId}
                        disabled={isDisabled}
                        onClick={() => handleSeatClick(seatLabel)}
                        className={`
                            ${seatSizeClass}
                            rounded-md font-bold flex items-center justify-center transition-all border
                            ${isSold 
                                ? "bg-red-500 text-white cursor-not-allowed border-red-600 opacity-80" 
                                : !isMatchSelling 
                                    ? "bg-gray-100 text-gray-300 cursor-not-allowed border-gray-200" // kiểu cho ghế chưa mở bán hoặc hết vé
                                    : isSelected 
                                        ? "text-white shadow-lg scale-110 border-transparent ring-2 ring-offset-1 ring-blue-400" 
                                        : "bg-white text-gray-600 hover:border-blue-500 hover:text-blue-600 border-gray-300 shadow-sm"
                            }
                        `}
                        style={isSelected && !isSold && isMatchSelling ? {backgroundColor: selectedConfig.color} : {}}
                        title={isSold ? "Đã bán" : !isMatchSelling ? "Tạm khóa" : `Ghế ${seatLabel}`} >
                        {isSold ? <X size={10}/> : seatLabel}
                    </button>
                );
            })}
        </div>
    );
  };

  const displayedConfigs = zoneFilter ? ticketConfigs.filter(c => c.zoneGroup === zoneFilter) : ticketConfigs;

  if (isLoading) return <UserLayout><div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40}/></div></UserLayout>;
  if (error || !match) return <UserLayout><div className="h-screen flex items-center justify-center flex-col"> <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy trận đấu!</h2> <Link to="/matches" className="text-blue-600 hover:underline">Quay lại danh sách</Link> </div></UserLayout>;

  return (
    <UserLayout>
      <div className="bg-gray-100 min-h-screen pb-12 relative">
        
        {showLimitModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center relative">
                    <button onClick={() => setShowLimitModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce"><AlertCircle size={32} /></div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Thông báo</h3>
                    <p className="text-gray-600 mb-6">Mỗi tài khoản chỉ được chọn tối đa <span className="font-bold text-red-600">4 vé</span>.</p>
                    <button onClick={() => setShowLimitModal(false)} className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition">Đã hiểu</button>
                </div>
            </div>
        )}

        <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-sm">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center gap-6">
                    <Link to="/matches" className="p-2 hover:bg-gray-100 rounded-full transition"><ChevronLeft/></Link>
                    <div>
                        <div className="flex items-center gap-3">
                             <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                {match.home_team} <span className="text-gray-400">vs</span> {match.away_team}
                            </h2>
                            {/* trạng thái trận đấu */}
                            {!isMatchSelling && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-300">
                                    {match.status === 'SOLD_OUT' ? 'HẾT VÉ' : match.status === 'ENDED' ? 'KẾT THÚC' : 'SẮP MỞ BÁN'}
                                </span>
                            )}
                        </div>
                        <div className="flex gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><MapPin size={14}/> {match.stadium_name}</span>
                            <span className="flex items-center gap-1"><Calendar size={14}/> {formatDate(match.start_time)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row gap-6 h-[80vh]">
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative flex flex-col">
                    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 bg-white p-1.5 rounded-lg shadow-lg border border-gray-200">
                        <button onClick={handleZoomIn} className="p-2 hover:bg-gray-100 rounded-md text-gray-700"><ZoomIn size={20}/></button>
                        <button onClick={handleZoomOut} className="p-2 hover:bg-gray-100 rounded-md text-gray-700"><ZoomOut size={20}/></button>
                        <button onClick={handleResetZoom} className="p-2 hover:bg-gray-100 rounded-md text-gray-700"><RotateCcw size={20}/></button>
                    </div>

                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 text-center relative z-10">
                        {viewMode === "stadium" ? (
                            <div className="flex items-center justify-center gap-2">
                                <h2 className="font-bold text-lg text-gray-800">Sơ đồ sân vận động</h2>
                                {zoneFilter && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1 cursor-pointer" onClick={() => setZoneFilter(null)}>Lọc: Khán đài {zoneFilter} <X size={12}/></span>}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <button onClick={handleBackToStadium} className="text-sm text-blue-600 hover:underline flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-blue-100 shadow-sm"><ChevronLeft size={16}/> Chọn khu vực khác</button>
                                <span className="text-gray-300">|</span>
                                <h2 className="font-bold text-lg text-gray-800">{selectedConfig?.zoneName}</h2>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 bg-gray-50 relative overflow-auto flex items-center justify-center p-4 select-none">
                        <div style={{ transform: `scale(${zoomLevel})`, transition: "transform 0.3s ease", transformOrigin: "center top" }} className="min-w-full min-h-full flex items-center justify-center relative">
                            {viewMode === "stadium" && (
                                <div className="relative w-[800px] h-[500px]">
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[55%] h-[40%] bg-green-600 rounded-[30px] border-4 border-white flex items-center justify-center shadow-xl z-0">
                                        <div className="w-full h-[1px] bg-white/50 absolute"></div><div className="w-[1px] h-full bg-white/50 absolute"></div><div className="w-20 h-20 border border-white/50 rounded-full absolute"></div>
                                    </div>
                                    {zones.map((zone) => (
                                        <div 
                                            key={zone.id} onClick={() => handleMapZoneClick(zone.group)}
                                            className={`absolute cursor-pointer flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-md hover:scale-105 hover:brightness-110 transition-all duration-200 z-10 rounded-md border border-white/20 ${zone.style.bg} ${zoneFilter && zoneFilter !== zone.group ? 'opacity-30 grayscale' : 'opacity-100'}`}
                                            style={{ top: zone.style.top, bottom: zone.style.bottom, left: zone.style.left, right: zone.style.right, width: zone.style.width, height: zone.style.height }}
                                        >
                                            {zone.name}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {viewMode === "zone" && (
                                <div className="flex flex-col items-center justify-center w-full h-full">
                                    
                                    {/* tb khi không mở bán */}
                                    {!isMatchSelling && (
                                        <div className="mb-6 p-4 bg-gray-100 border border-gray-300 rounded-xl flex flex-col items-center text-gray-500 animate-in fade-in zoom-in shadow-sm">
                                            <AlertCircle size={32} className="mb-2"/>
                                            <h3 className="font-bold text-lg">
                                                {match.status === 'SOLD_OUT' ? 'Đã hết vé!' : match.status === 'ENDED' ? 'Trận đấu đã kết thúc' : 'Chưa mở bán vé'}
                                            </h3>
                                            <p className="text-sm">Bạn không thể chọn ghế vào lúc này.</p>
                                        </div>
                                    )}

                                    {isLoadingSeats ? (
                                        <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin"/> Đang tải trạng thái ghế...</div>
                                    ) : (
                                        <>
                                            {/* chú thích */}
                                            <div className="flex gap-4 mb-4 text-xs font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                                                <div className="flex items-center gap-2"><div className="w-4 h-4 border border-gray-300 rounded bg-white"></div> Trống</div>
                                                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded text-white flex items-center justify-center"><X size={12}/></div> Đã bán</div>
                                                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded" style={{backgroundColor: selectedConfig?.color}}></div> Đang chọn</div>
                                            </div>
                                            {renderSeats()}
                                            
                                            <div className="mt-4 text-center text-sm text-gray-500">
                                                <div className="w-[60%] h-8 bg-gray-100 rounded-full mx-auto flex items-center justify-center text-xs text-gray-400 font-bold shadow-inner mb-2">HƯỚNG SÂN</div>
                                                <p>Đang chọn: <span className="font-bold" style={{color: selectedConfig?.color}}>{selectedConfig?.name}</span></p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-80 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden h-full">
                    <div className="p-4 border-b border-gray-100 bg-red-50">
                        <h3 className="font-bold text-gray-800 text-lg">Chọn vé</h3>
                        <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                            <span>{zoneFilter ? `Lọc: Khu vực ${zoneFilter}` : "Hiển thị tất cả khu vực"}</span>
                            {zoneFilter && <button onClick={handleClearFilter} className="text-blue-600 hover:underline font-medium">Xem tất cả</button>}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {displayedConfigs.length > 0 ? displayedConfigs.map((config) => (
                            <div key={config.id} onClick={() => handleConfigClick(config)} className={`group border rounded-xl p-4 hover:shadow-md transition cursor-pointer relative overflow-hidden ${selectedConfig?.id === config.id ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                                <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: config.color }}></div>
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded" style={{ backgroundColor: config.color }}>{config.name}</span>
                                    {selectedConfig?.id === config.id && <Check size={16} className="text-blue-600"/>}
                                </div>
                                <h4 className="font-bold text-gray-900 text-sm mb-1">{config.zoneName}</h4>
                                <div className="flex justify-between items-end">
                                    <p className="text-lg font-bold text-red-600">{config.price.toLocaleString()}đ</p>
                                    <p className="text-[10px] text-gray-500">Còn {config.quantity - config.sold}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center text-gray-400 py-10"><p>Không có vé nào ở khu vực này.</p>{zoneFilter && <button onClick={handleClearFilter} className="text-blue-600 text-sm underline mt-2">Xem tất cả</button>}</div>
                        )}
                    </div>
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <button onClick={() => { if (cartItems.length > 0) navigate('/cart'); }} disabled={cartItems.length === 0} className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><ShoppingCart size={18}/> Giỏ hàng ({cartItems.length})</button>
                    </div>                         
                </div>
            </div>
            <div className="mt-12"><CommentSection matchId={id} /></div>
        </div>
      </div>
    </UserLayout>
  );
}