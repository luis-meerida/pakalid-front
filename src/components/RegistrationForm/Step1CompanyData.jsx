import { useState, useEffect } from 'react';
import { Button, Card, Form, Input, Select, Row, Col, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import ReactCountryFlag from "react-country-flag";
import {
  getPaises,
  getEstados,
  getCiudades,
  getPorCP,
} from "../../api/ubicacion.api";
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;

// Lista de prefijos telefónicos internacionales con códigos ISO
const countryCallingCodes = [
  { code: '+52', iso: 'MX', name: 'México' },
  { code: '+1', iso: 'US', name: 'Estados Unidos/Canadá' },
  { code: '+54', iso: 'AR', name: 'Argentina' },
  { code: '+56', iso: 'CL', name: 'Chile' },
  { code: '+57', iso: 'CO', name: 'Colombia' },
  { code: '+58', iso: 'VE', name: 'Venezuela' },
  { code: '+34', iso: 'ES', name: 'España' },
  { code: '+51', iso: 'PE', name: 'Perú' },
  { code: '+593', iso: 'EC', name: 'Ecuador' },
  { code: '+503', iso: 'SV', name: 'El Salvador' },
  { code: '+502', iso: 'GT', name: 'Guatemala' },
  { code: '+504', iso: 'HN', name: 'Honduras' },
  { code: '+505', iso: 'NI', name: 'Nicaragua' },
  { code: '+507', iso: 'PA', name: 'Panamá' },
  { code: '+506', iso: 'CR', name: 'Costa Rica' }
];

// Tipos de teléfono disponibles
const phoneTypes = [
  { value: 'mobile', label: 'Celular' },
  { value: 'office', label: 'Oficina' }
];


const validatePhone = (_, value) => {
  if (!value) return Promise.resolve();
  
  const phoneRegex = /^(\(\d{3}\)|\d{3})[\s-]?\d{1,3}([\s-]?\d{2,3}){1,2}$/;
  
  if (phoneRegex.test(value)) {
    return Promise.resolve();
  }
  return Promise.reject(new Error('Formato inválido. Use: 999 123 4567 o (999)1 23 45 67'));
};

const PhoneInput = ({ value = [], onChange }) => {
  const handleAdd = () => {
    onChange([...value, { code: '+52', number: '', type: 'mobile' }]);
  };

  const handleRemove = (index) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  const handleChange = (index, field, fieldValue) => {
    const newValue = [...value];
    newValue[index][field] = fieldValue;
    onChange(newValue);
  };

  return (
    <div>
      {value.map((item, index) => (
        <div key={index} style={{ marginBottom: 16 }}>
          <Row gutter={8} align="middle">
            <Col span={4}>
              <Form.Item
                name={`phones[${index}].type`}
                rules={[{ required: true, message: 'Tipo requerido' }]}
                initialValue="mobile"
                noStyle
              >
                <Select
                  placeholder="Tipo"
                  value={item.type}
                  onChange={(value) => handleChange(index, 'type', value)}
                  style={{ width: '100%' }}
                >
                  {phoneTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item
                name={`phones[${index}].code`}
                rules={[
                  { required: true, message: 'Prefijo requerido' },
                  {
                    validator: (_, value) => {
                      if (value && value.startsWith('+') && /^\+\d{1,3}$/.test(value)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Ingrese un prefijo válido (ej. +52)'));
                    }
                  }
                ]}
                noStyle
              >
                <Select
                  showSearch
                  placeholder="+52"
                  optionFilterProp="children"
                  value={item.code}
                  onChange={(value) => handleChange(index, 'code', value)}
                  filterOption={(input, option) =>
                    option.props.children[1].toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ width: '100%' }}
                  optionLabelProp="label"
                >
                  {countryCallingCodes.map((country) => (
                    <Option 
                      key={country.code} 
                      value={country.code}
                      label={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <ReactCountryFlag 
                            countryCode={country.iso}
                            style={{ marginRight: 8, width: '20px' }}
                            svg
                          />
                          {country.code}
                        </div>
                      }
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <ReactCountryFlag 
                          countryCode={country.iso}
                          style={{ marginRight: 8, width: '20px' }}
                          svg
                        />
                        <span style={{ marginRight: 8 }}>{country.code}</span>
                        <span style={{ color: '#888' }}>{country.name}</span>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={13}>
              <Form.Item
                name={`phones[${index}].number`}
                rules={[
                  { required: true, message: 'Número requerido' },
                  { validator: validatePhone }
                ]}
                noStyle
              >
                <Input
                  placeholder="Número (ej. 999 123 4567)"
                  value={item.number}
                  onChange={(e) => handleChange(index, 'number', e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col span={2}>
              <Button danger onClick={() => handleRemove(index)}>
                X
              </Button>
            </Col>
          </Row>
        </div>
      ))}
      <Button type="dashed" onClick={handleAdd} style={{ width: '100%', marginTop: 8 }}>
        + Agregar Teléfono
      </Button>
    </div>
  );
};

function Step1CompanyData({ onNext, initialValues }) {
  

const [cp, setCP] = useState('');
  const [paises, setPaises] = useState([]);
  const [estados, setEstados] = useState([]);
  const [ciudades, setCiudades] = useState([]);

  const [pais, setPais] = useState('Mexico');
  const [estado, setEstado] = useState('');
  const [ciudad, setCiudad] = useState('');


useEffect(() => {
  async function cargarDatos() {
    try {
      // Obtener todos los países
      const resPaises = await getPaises();
      const paisesData = resPaises.data;

      // Buscar México por nombre (ignorando mayúsculas/minúsculas)
      const mexico = paisesData.find((p) => p.name.toLowerCase() === 'méxico' || p.name.toLowerCase() === 'mexico');

      // Eliminar México de la lista para no repetirlo, lo añadiremos primero
      const lista = paisesData.filter((p) => p.name.toLowerCase() !== 'méxico' && p.name.toLowerCase() !== 'mexico');

      // Insertar México al principio y setear
      const paisFinal = mexico || { id: 999, name: 'Mexico' };
      setPaises([paisFinal, ...lista]);
      setPais(paisFinal.name);
      form.setFieldsValue({ country: paisFinal.name }); // Si estás usando AntD Form

      // Cargar estados de México por defecto
      const resEstados = await getEstados(paisFinal.name);
      setEstados(resEstados.data);

    } catch (err) {
      console.error('Error al cargar países/estados:', err);
    }
  }

  cargarDatos();
}, []);


  const handlePaisChange = (e) => {
    const nuevoPais = e.target.value;
    setPais(nuevoPais);
    setEstado('');
    setCiudad('');
    setCiudades([]);
    getEstados(nuevoPais).then((res) => setEstados(res.data));
  };

  const handleEstadoChange = (e) => {
    const nuevoEstado = e.target.value;
    setEstado(nuevoEstado);
    setCiudad('');
    getCiudades(pais, nuevoEstado).then((res) => setCiudades(res.data));
  };

  const handleCPBuscar = () => {
    if (!cp.trim()) return alert('Ingresa un código postal');
    getPorCP(cp)
      .then((res) => {
        const data = res.data;
        if (!data || !data.pais || !data.estado || !data.ciudad) {
          alert('No se encontró la ubicación para ese CP');
          return;
        }

        setPais(data.pais);
        setEstado(data.estado);
        setCiudad(data.ciudad);

        getEstados(data.pais).then((res) => {
          setEstados(res.data);
          getCiudades(data.pais, data.estado).then((res) =>
            setCiudades(res.data)
          );
        });
      })
      .catch((err) => {
        console.error(err);
        alert('Error al buscar por código postal');
      });
  };

  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  // Cargar valores iniciales
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        phones: initialValues.phones || [{ code: '+52', number: '', type: 'mobile' }]
      });
      if (initialValues.logo) {
        setFileList(initialValues.logo);
      }
    }
  }, [initialValues, form]);

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Solo se permiten imágenes!');
      return Upload.LIST_IGNORE;
    }
    
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('La imagen debe ser menor a 2MB!');
      return Upload.LIST_IGNORE;
    }
    
    return false;
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const onFinish = async (values) => {
  try {
    const payload = {
      name: values.name,
      address: values.address,
      suburb: values.neighborhood,
      postal_code: values.zipCode,
      fk_prospect_status_id: 1, // fijo o según lógica
      fk_city_code_id: ciudad || '',

      logo_path: fileList[0]?.name || '',
      latitud: '',
      longitud: '',
      zoom: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };

    console.log('Datos enviados al backend:', payload); // 👈 Aquí se imprime el payload

    const response = await axios.post('http://localhost:3000/prospects', payload);

    message.success('Prospecto creado correctamente');
    onNext(response.data); // continúa al siguiente paso
  } catch (error) {
    console.error('Error al crear el prospecto:', error);
    message.error('Error al enviar los datos al servidor');
  }
};

  return (
    <Card>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          phones: [{ code: '+52', number: '', type: 'mobile' }]
        }}
        validateMessages={{
          required: 'Este campo es obligatorio',
          types: {
            email: 'No es un email válido',
          },
        }}
      >
        {/* Nombre */}
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="name"
              label="Nombre"
              rules={[
                { required: true },
                { min: 3, message: 'Mínimo 3 caracteres' },
                { max: 100, message: 'Máximo 100 caracteres' }
              ]}
            >
              <Input placeholder="Ingrese el nombre legal de la empresa" />
            </Form.Item>
          </Col>
        </Row>

        {/* Dirección */}
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="address"
              label="Dirección"
              rules={[
                { required: true, message: 'La dirección es obligatoria' },
                { min: 10, message: 'La dirección debe tener al menos 10 caracteres' },
                { max: 200, message: 'La dirección no puede exceder 200 caracteres' }
              ]}
            >
              <Input placeholder="Calle y número" />
            </Form.Item>
          </Col>
        </Row>

        {/* Colonia y Código Postal */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="neighborhood"
              label="Colonia"
              rules={[
                { required: true, message: 'La colonia es obligatoria' },
                { min: 3, message: 'Mínimo 3 caracteres' },
                { max: 50, message: 'Máximo 50 caracteres' }
              ]}
            >
              <Input placeholder="Ej. Centro, Roma Norte, etc." />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="zipCode"
              label="Código postal"
              rules={[
                { required: true, message: 'El código postal es obligatorio' },
                { min: 3, message: 'Mínimo 3 caracteres' },
                { max: 10, message: 'Máximo 10 caracteres' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value) return Promise.resolve();
                    
                    if (getFieldValue('country') === 'mx' && !/^\d{5}$/.test(value)) {
                      return Promise.reject(new Error('El código postal mexicano debe tener 5 dígitos'));
                    }
                    
                    if (!/^[a-zA-Z0-9\- ]+$/.test(value)) {
                      return Promise.reject(new Error('Solo se permiten letras, números, espacios y guiones'));
                    }
                    
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Input 
                placeholder="Ej. 06100 (México) o A1A 1A1 (Canadá)" 
                maxLength={10}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* País, Estado y Ciudad */}
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="country"
              label="País"
              rules={[{ required: true, message: 'Seleccione el país donde está registrada la empresa' }]}
            >
              <Select
                value={pais}
                onChange={(value) => handlePaisChange({ target: { value } })}
              >
                {paises.map((p) => (
                  <Option key={p.id} value={p.name}>
                    {p.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="state"
              label="Estado"
              rules={[{ required: true, message: 'Seleccione un estado/provincia' }]}
            >
              <Select
                value={estado}
                onChange={(value) => handleEstadoChange({ target: { value } })}
                disabled={!estados.length}
              >
                {estados.map((e) => (
                  <Option key={e.id} value={e.name}>
                    {e.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="city"
              label="Ciudad"
              rules={[{ required: true, message: 'Seleccione una ciudad/municipio' }]}
            >
              <Select
                value={ciudad}
                onChange={(value) => setCiudad(value)}
                disabled={!ciudades.length}
              >
                {ciudades.map((c) => (
                  <Option key={c.id} value={c.name}>
                    {c.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Teléfonos de contacto */}
        <Form.Item
          name="phones"
          label="Teléfonos"
          rules={[
            {
              validator: (_, value) => {
                if (!value || value.length === 0) {
                  return Promise.reject(new Error('Debe registrar al menos un número telefónico'));
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <PhoneInput />
        </Form.Item>

        {/* Logo corporativo */}
        <Form.Item
          name="logo"
          label="Logo"
          extra="Formatos aceptados: JPG, PNG. Tamaño máximo: 2MB"
        >
          <Upload
            fileList={fileList}
            beforeUpload={beforeUpload}
            onChange={handleUploadChange}
            maxCount={1}
            accept="image/*"
            listType="picture-card"
          >
            {fileList.length >= 1 ? null : (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Subir logo</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Siguiente
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default Step1CompanyData;