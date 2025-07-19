import { Button, Card, Form, Input, Select, Row, Col, message } from 'antd';
import { useState, useEffect } from 'react';

const { Option } = Select;

const validateRFC = (_, value) => {
  if (!value) return Promise.resolve();
  
  // Validación de longitud
  if (value.length < 12 || value.length > 13) {
    return Promise.reject(new Error('El RFC debe tener entre 12 y 13 caracteres'));
  }

  // Validación de formato
  const rfcMoralRegex = /^[A-ZÑ&]{3}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[A-Z\d]{2}[A\d]$/;
  const rfcFisicaRegex = /^[A-ZÑ&]{4}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[A-Z\d]{3}$/;
  
  if (rfcMoralRegex.test(value) || rfcFisicaRegex.test(value)) {
    return Promise.resolve();
  }
  return Promise.reject(new Error('Ingrese un RFC válido para persona física o moral'));
};

function Step4FiscalData({ onPrev, onFinish, initialValues }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [taxRegimes, setTaxRegimes] = useState([]);
  const [cfdiUses, setCfdiUses] = useState([]);

  // Cargar valores iniciales
  useEffect(() => {
  form.resetFields();

  if (initialValues?.fiscal) {
    form.setFieldsValue({
      businessName: initialValues.fiscal.businessName || '',
      rfc: initialValues.fiscal.rfc || '',
      billingEmail: initialValues.fiscal.billingEmail || '',
      fiscalAddress: initialValues.fiscal.fiscalAddress || '',
      fiscalZipCode: initialValues.fiscal.fiscalZipCode || '',
      regime: initialValues.fiscal.regime || undefined,
      cfdiUse: initialValues.fiscal.cfdiUse || undefined
    });
  }

  async function fetchCatalogs() {
    try {
      const [regimesRes, cfdiUsesRes] = await Promise.all([
        getTaxRegimes(),
        getCfdiUses()
      ]);
      setTaxRegimes(regimesRes.data);
      setCfdiUses(cfdiUsesRes.data);
    } catch (error) {
      console.error('Error al cargar catálogos fiscales', error);
      message.error('No se pudieron cargar los catálogos fiscales');
    }
  }

  fetchCatalogs();
}, [initialValues, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const completeData = {
        ...initialValues,
        fiscal: {
          ...values,
          businessName: values.businessName?.trim(),
          rfc: values.rfc?.trim().toUpperCase(),
          billingEmail: values.billingEmail?.trim().toLowerCase(),
          fiscalAddress: values.fiscalAddress?.trim(),
          fiscalZipCode: values.fiscalZipCode?.trim()
        }
      };
      
      await onFinish(completeData);
      message.success('Datos fiscales guardados correctamente');
    } catch (error) {
      message.error('Error al guardar los datos fiscales');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    const currentValues = form.getFieldsValue();
    onPrev({ 
      ...initialValues,
      fiscal: {
        ...currentValues,
        rfc: currentValues.rfc?.toUpperCase()
      }
    });
  };

  return (
    <Card>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        validateMessages={{
          required: 'Este campo es obligatorio',
        }}
        preserve={false}
      >
        <h4>Llene el formulario, solamente si cuentas con Datos Fiscales</h4>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="businessName"
              label="Razón Social"
              rules={[
                { required: true, message: 'La razón social es obligatoria' },
                { min: 3, message: 'Mínimo 3 caracteres' },
                { max: 150, message: 'Máximo 150 caracteres' },
                {
                  pattern: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,-]+$/,
                  message: 'Caracteres no válidos'
                }
              ]}
            >
              <Input 
                placeholder="Nombre legal de la empresa" 
                autoComplete="organization"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="rfc"
              label="RFC"
              rules={[
                { required: true, message: 'El RFC es obligatorio' },
                { min: 12, message: 'Mínimo 12 caracteres' },
                { max: 13, message: 'Máximo 13 caracteres' },
                { validator: validateRFC }
              ]}
            >
              <Input 
                placeholder="Ingrese su RFC con homoclave" 
                autoComplete="off"
                style={{ textTransform: 'uppercase' }}
                maxLength={13}
              />
            </Form.Item>
          </Col>
        </Row>

        <h4>Datos de Facturación:</h4>

        <Form.Item
          name="billingEmail"
          label="Correo de facturación"
          rules={[
            { required: true, message: 'El correo de facturación es obligatorio' },
            { type: 'email', message: 'Ingrese un email válido' }
          ]}
        >
          <Input 
            placeholder="facturacion@empresa.com" 
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item
          name="fiscalAddress"
          label="Dirección Fiscal"
          rules={[
            { required: true, message: 'La dirección fiscal es obligatoria' },
            { min: 10, message: 'Mínimo 10 caracteres' },
            { max: 200, message: 'Máximo 200 caracteres' }
          ]}
        >
          <Input.TextArea 
            rows={3} 
            placeholder="Calle, número, colonia, código postal, ciudad, estado" 
            autoComplete="street-address"
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="fiscalZipCode"
              label="Código Postal"
              rules={[
                { required: true, message: 'El código postal es obligatorio' },
                { pattern: /^\d+$/, message: 'Solo se permiten números' },
                { len: 5, message: 'Debe tener exactamente 5 dígitos' }
              ]}
            >
              <Input 
                placeholder="00000" 
                maxLength={5} 
                autoComplete="postal-code"
              />
            </Form.Item>
          </Col>
        </Row>

        <h4>Configuración Fiscal:</h4>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="regime"
              label="Régimen"
              rules={[{ required: true, message: 'Seleccione un régimen fiscal' }]}
            >
              <Select 
                placeholder="Seleccione su régimen fiscal"
                optionFilterProp="children"
                showSearch
              >
                {taxRegimes.map((regime) => (
                  <Option key={regime.code} value={regime.code}>
                    {regime.code} - {regime.description}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="cfdiUse"
              label="Uso del C.F.D.I"
              rules={[{ required: true, message: 'Seleccione un uso de CFDI' }]}
            >
              <Select 
                placeholder="Seleccione el uso de CFDI"
                optionFilterProp="children"
                showSearch
              >
                {cfdiUses.map((cfdi) => (
                  <Option key={cfdi.code} value={cfdi.code}>
                    {cfdi.code} - {cfdi.description}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button 
            type="default" 
            onClick={handlePrev} 
            style={{ marginRight: 8 }}
          >
          
            Anterior (Datos de Usuario)
          </Button>
          <Button 
            type="primary" 
            htmlType="submit"
            loading={loading}
            disabled={loading}
          >
            Finalizar Registro
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default Step4FiscalData;