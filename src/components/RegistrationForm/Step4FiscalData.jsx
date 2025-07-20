import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Input, Row, Select, message } from 'antd';
import { getTaxRegimes, getCFDIUse } from '../../api/tax-catalogs.api';

const { Option } = Select;

const Step4FiscalData = ({ onFinish, onPrevious }) => {
  const [form] = Form.useForm();
  const [regimes, setRegimes] = useState([]);
  const [cfdiUses, setCfdiUses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getTaxRegimes().then((res) => setRegimes(res.data)).catch(console.error);
    getCFDIUse().then((res) => setCfdiUses(res.data)).catch(console.error);

    const savedData = JSON.parse(localStorage.getItem('prospectFiscalData') || '{}');
    form.setFieldsValue(savedData);
  }, []);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      // Recolectar los datos guardados en localStorage de pasos anteriores
      const companyData = JSON.parse(localStorage.getItem('prospectData') || '{}');
      const userData = JSON.parse(localStorage.getItem('prospectUserData') || '{}');

      const fiscalData = {
        ...values,
        businessName: values.businessName?.trim(),
        rfc: values.rfc?.trim().toUpperCase(),
        billingEmail: values.billingEmail?.trim().toLowerCase(),
        fiscalAddress: values.fiscalAddress?.trim(),
        fiscalZipCode: values.fiscalZipCode?.trim()
      };

      // Guardar en localStorage también, por si acaso
      localStorage.setItem('prospectFiscalData', JSON.stringify(fiscalData));

      // Simulación de envío
      console.log('Datos enviados al backend:', {
        companyData,
        locationData,
        userData,
        fiscalData
      });

      message.success('Registro completado exitosamente');

      // Limpieza opcional
      localStorage.removeItem('prospectCompanyData');
      localStorage.removeItem('prospectLocationData');
      localStorage.removeItem('prospectUserData');
      localStorage.removeItem('prospectFiscalData');

      // Continuar flujo
      if (onFinish) await onFinish();
    } catch (error) {
      console.error('Error al finalizar el registro:', error);
      message.error('Ocurrió un error al finalizar el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{}}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="businessName"
            label="Razón Social"
            rules={[{ required: true, message: 'Por favor ingresa la razón social' }]}
          >
            <Input placeholder="Nombre legal de la empresa" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="rfc"
            label="RFC"
            rules={[{ required: true, message: 'Por favor ingresa el RFC' }]}
          >
            <Input placeholder="RFC sin guiones ni espacios" maxLength={13} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="billingEmail"
            label="Correo de Facturación"
            rules={[
              { required: true, message: 'Por favor ingresa un correo válido' },
              { type: 'email', message: 'Correo no válido' }
            ]}
          >
            <Input placeholder="correo@ejemplo.com" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="fiscalAddress"
            label="Dirección Fiscal"
            rules={[{ required: true, message: 'Por favor ingresa la dirección fiscal' }]}
          >
            <Input placeholder="Calle, número, colonia, etc." />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="fiscalZipCode"
            label="Código Postal Fiscal"
            rules={[{ required: true, message: 'Por favor ingresa el código postal' }]}
          >
            <Input placeholder="Ej. 12345" maxLength={5} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="taxRegime"
            label="Régimen Fiscal"
            rules={[{ required: true, message: 'Por favor selecciona un régimen fiscal' }]}
          >
            <Select placeholder="Selecciona un régimen">
              {regimes.map((reg) => (
                <Option key={reg.id} value={reg.name}>{reg.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="cfdiUse"
            label="Uso del CFDI"
            rules={[{ required: true, message: 'Por favor selecciona un uso del CFDI' }]}
          >
            <Select placeholder="Selecciona un uso">
              {cfdiUses.map((cfdi) => (
                <Option key={cfdi.id} value={cfdi.name}>{cfdi.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onPrevious}>
          Anterior
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          Finalizar Registro
        </Button>
      </div>
    </Form>
  );
};

export default Step4FiscalData;
