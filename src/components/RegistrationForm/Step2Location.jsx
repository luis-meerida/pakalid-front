import { useState, useRef, useEffect } from 'react';
import { Button, Card, Form, Input, message } from 'antd';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para íconos rotos
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function Step2Location({ onNext, onPrev, initialValues }) {
  const [form] = Form.useForm();
  const [position, setPosition] = useState([19.4326, -99.1332]); // Posición inicial (CDMX)
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Cargar valores iniciales
  useEffect(() => {
    if (initialValues && initialValues.location) {
      const { lat, lng, address } = initialValues.location;
      setPosition([lat, lng]);
      form.setFieldsValue({
        address: address,
        location: initialValues.location
      });
      
      // Mover el mapa a la posición guardada
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lng], 15);
        }
      }, 100);
    }
  }, [initialValues, form]);

  // Función para actualizar el mapa y marcador
  const updateMapPosition = (lat, lng, address) => {
    // Actualizar estado de posición
    setPosition([lat, lng]);
    
    // Mover el mapa a la nueva posición
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], 15, {
        duration: 1, // Duración de la animación en segundos
      });
    }
    
    // Actualizar el formulario
    form.setFieldsValue({
      address: address,
      location: {
        lat: lat,
        lng: lng,
        address: address
      }
    });
  };

  // Manejar búsqueda de dirección
  const handleSearch = async (address) => {
    if (!address) {
      message.warning('Por favor ingresa una dirección');
      return;
    }

    try {
      message.loading('Buscando dirección...', 0);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const results = await response.json();
      
      message.destroy();
      
      if (results.length > 0) {
        const firstResult = results[0];
        updateMapPosition(
          parseFloat(firstResult.lat),
          parseFloat(firstResult.lon),
          firstResult.display_name
        );
        message.success('Dirección encontrada');
      } else {
        message.error('No se encontró la dirección');
      }
    } catch (error) {
      message.destroy();
      message.error('Error al buscar la dirección');
      console.error('Error en geocoding:', error);
    }
  };

  // Manejar clic en el mapa
  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      updateMapPosition(lat, lng, data.display_name || 'Ubicación seleccionada');
    } catch (error) {
      console.error('Error en reverse geocoding:', error);
      updateMapPosition(lat, lng, 'Ubicación seleccionada');
    }
  };

  const handleSubmit = (values) => {
  if (!values.location) {
    message.error('Por favor selecciona una ubicación');
    return;
  }

  const { lat, lng } = values.location;
  const zoom = mapRef.current?.getZoom?.() || 15;

  onNext({
    location: {
      ...values.location,
      latitud: lat.toString(),
      longitud: lng.toString(),
      zoom: zoom.toString(),
    },
  });
};

  const handleGoBack = () => {
    // Obtener valores actuales del formulario
    const currentValues = form.getFieldsValue();
    
    // Pasar los datos al paso anterior
    onPrev({ location: currentValues.location });
  };

  return (
    <Card>
      <Form 
        form={form} 
        layout="vertical" 
        onFinish={handleSubmit}
        initialValues={initialValues}
      >
        <Form.Item
          name="address"
          label="Dirección completa"
          rules={[{ required: true, message: 'Por favor busca una dirección' }]}
        >
          <Input.Search
            placeholder="Ej: Av. Paseo de la Reforma 222, CDMX"
            enterButton="Guardar"
            onSearch={handleSearch}
            loading={false}
            style={{ marginBottom: 16 }}
          />
        </Form.Item>

        <Form.Item name="location" hidden>
          <Input />
        </Form.Item>

        <div style={{ height: '400px', marginBottom: 24, borderRadius: 8, overflow: 'hidden' }}>
          <MapContainer
            center={position}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            whenCreated={(map) => {
              mapRef.current = map;
            }}
            onClick={handleMapClick}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker
              position={position}
              ref={markerRef}
              eventHandlers={{
                dragend: () => {
                  const marker = markerRef.current;
                  if (marker != null) {
                    const { lat, lng } = marker.getLatLng();
                    handleMapClick({ latlng: { lat, lng } });
                  }
                }
              }}
              draggable={true}
            >
              <Popup>{form.getFieldValue('address') || 'Ubicación seleccionada'}</Popup>
            </Marker>
          </MapContainer>
        </div>

        <Form.Item>
          <Button onClick={handleGoBack} style={{ marginRight: 8 }}>
            Anterior
          </Button>
          <Button type="primary" htmlType="submit">
            Siguiente
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default Step2Location;