import { useState, useEffect } from 'react';
import { APIProvider, Map, Marker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axios';
import Modal from '../components/Modal'; 


interface Cafe {
  id: number;
  title: string;
  description: string | null;
  address: string;
  latitude: number;
  longitude: number;
  category: string | null;
  imageUrl: string | null;
  googleMapsUrl: string | null;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    name: string | null;
  };
}



function NewCafeForm({ position, onAddSuccess }: { position: { lat: number; lng: number }; onAddSuccess: (newCafe: Cafe) => void; }) {
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const { token } = useAuth();
  const map = useMap();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !address) {
      alert('請填寫標題和地址');
      return;
    }
    try {
      const response = await apiClient.post('/cafes', 
        { title, address, latitude: position.lat, longitude: position.lng },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('新增地點成功');
      onAddSuccess(response.data);
    } catch (error) {
      console.error('新增地點失敗:', error);
      alert('新增地點失敗');
    }
  };

  useEffect(() => {
    if(map) map.panTo(position);
  }, [map, position]);

  return (
    <div style={{ padding: '10px', backgroundColor: 'white', color: 'black' }}>
      <h4>新增咖啡廳</h4>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="標題" value={title} onChange={e => setTitle(e.target.value)} required /><br />
        <input type="text" placeholder="地址" value={address} onChange={e => setAddress(e.target.value)} required /><br />
        <button type="submit">儲存</button>
      </form>
    </div>
  );
}



function HomePage() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [newCafePosition, setNewCafePosition] = useState<{ lat: number; lng: number } | null>(null);
  const [editingCafe, setEditingCafe] = useState<Cafe | null>(null);
  const { user, token } = useAuth(); 
  
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_JS_KEY;
  const position = { lat: 25.033964, lng: 121.564468 };

  useEffect(() => {
    const fetchCafes = async () => {
      try {
        const response = await apiClient.get('/cafes');
        setCafes(response.data);
      } catch (error) {
        console.error('無法獲取地點:', error);
      }
    };
    fetchCafes();
  }, []);
  
  const handleEditSuccess = (updatedCafe: Cafe) => {
    setCafes(cafes.map(cafe => cafe.id === updatedCafe.id ? updatedCafe : cafe));
    setEditingCafe(null); 
    setSelectedCafe(updatedCafe); 
    alert('地點更新成功');
  };
  
  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (!user) {
      alert('請先登入才能新增地點');
      return;
    }
    setSelectedCafe(null);
    const lat = event.detail.latLng?.lat;
    const lng = event.detail.latLng?.lng;
    if (lat && lng) {
      setNewCafePosition({ lat, lng });
    }
  };

  const handleAddSuccess = (newCafe: Cafe) => {
    setCafes(prevCafes => [...prevCafes, newCafe]);
    setNewCafePosition(null);
  };

  
  const handleDelete = async (cafeId: number) => {
    if (window.confirm('確定要刪除這個地點嗎？')) {
      try {
        await apiClient.delete(`/cafes/${cafeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setCafes(cafes.filter(cafe => cafe.id !== cafeId));
        setSelectedCafe(null); 
        alert('地點刪除成功');

      } catch (error) {
        console.error('刪除地點失敗:', error);
        alert('刪除失敗，沒有權限。');
      }
    }
  };


  
  if (!apiKey) return <div><h1>錯誤: 找不到 Google Maps API 金鑰。</h1></div>;

  return (
    <APIProvider apiKey={apiKey}>
      <div style={{ height: "100vh", width: "100%" }}>
        <Map
          defaultCenter={position} defaultZoom={15} mapId="a3b56a9e34241eac"
          gestureHandling={'greedy'} disableDefaultUI={true} onClick={handleMapClick}
        >
          {cafes.map(cafe => (
            <Marker
              key={cafe.id}
              position={{ lat: cafe.latitude, lng: cafe.longitude }}
              onClick={() => { setNewCafePosition(null); setSelectedCafe(cafe); }}
            />
          ))}

          {/* =*/}
          {/* */}
          {/* =*/}
          {selectedCafe && (
            <InfoWindow
              position={{ lat: selectedCafe.latitude, lng: selectedCafe.longitude }}
              onCloseClick={() => setSelectedCafe(null)}
            >
              <div className="info-window-content">
                {selectedCafe.imageUrl && (
                  <img 
                    src={selectedCafe.imageUrl} 
                    alt={selectedCafe.title} 
                    className="info-window-image"
                  />
                )}
                <h3>{selectedCafe.title}</h3>
                <p className="info-address">{selectedCafe.address}</p>
                <p className="info-author">
                  新增者: {selectedCafe.author.name || '匿名'}
                </p>

                {selectedCafe.googleMapsUrl && (
                  <a 
                    href={selectedCafe.googleMapsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="info-window-link"
                  >
                    在 Google 地圖上開啟
                  </a>
                )}
                
                {user && user.userId === selectedCafe.authorId && (
                  <div className="info-window-actions">
                    <button onClick={() => setEditingCafe(selectedCafe)} style={{marginRight: '5px'}}>編輯</button>
                    <button onClick={() => handleDelete(selectedCafe.id)}>刪除</button>
                  </div>
                )}
              </div>
            </InfoWindow>
          )}
          {/* =*/}
          {/* */}
          {/* =*/}

          {newCafePosition && (
            <>
              <Marker position={newCafePosition} />
              <InfoWindow position={newCafePosition} onCloseClick={() => setNewCafePosition(null)}>
                <NewCafeForm position={newCafePosition} onAddSuccess={handleAddSuccess} />
              </InfoWindow>
            </>
          )}
        </Map>
      </div>

      <Modal isOpen={!!editingCafe} onClose={() => setEditingCafe(null)}>
        {editingCafe && (
          <EditCafeForm 
            cafe={editingCafe}
            onEditSuccess={handleEditSuccess}
            onCancel={() => setEditingCafe(null)}
          />
        )}
      </Modal>

    </APIProvider>
  );
}

export default HomePage;


interface EditCafeFormProps {
  cafe: Cafe;
  onEditSuccess: (updatedCafe: Cafe) => void;
  onCancel: () => void;
}

function EditCafeForm({ cafe, onEditSuccess, onCancel }: EditCafeFormProps) {
  const [title, setTitle] = useState(cafe.title);
  const [address, setAddress] = useState(cafe.address);
  const [description, setDescription] = useState(cafe.description || '');
  const { token } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiClient.put(`/cafes/${cafe.id}`,
        { title, address, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      onEditSuccess(response.data);
    } catch (error) {
      console.error("更新失敗:", error);
      alert('更新失敗');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>編輯地點</h3>
      <div style={{ margin: '10px 0' }}>
        <label style={{ marginRight: '5px' }}>標題: </label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
      </div>
      <div style={{ margin: '10px 0' }}>
        <label style={{ marginRight: '5px' }}>地址: </label>
        <input type="text" value={address} onChange={e => setAddress(e.target.value)} required />
      </div>
      <div style={{ margin: '10px 0' }}>
        <label style={{ marginRight: '5px' }}>描述: </label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <button type="submit">儲存變更</button>
      <button type="button" onClick={onCancel} style={{marginLeft: '10px'}}>取消</button>
    </form>
  );
}