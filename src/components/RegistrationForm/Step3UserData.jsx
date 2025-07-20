import { useState, useEffect } from 'react';
import moment from 'moment';
import { Button, Card, Form, Input, Select, Row, Col, Upload, DatePicker, message } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';

const { Option } = Select;

function Step3UserData({ onNext, onPrev, initialValues }) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar valores iniciales incluyendo el avatar
  useEffect(() => {
    if (initialValues?.user) {
      const { avatar, ...userData } = initialValues.user;
      form.setFieldsValue({
        ...userData,
        birthDate: userData.birthDate ? moment(userData.birthDate) : null
      });

      if (avatar) {
        if (typeof avatar === 'string') {
          setFileList([{
            uid: '-1',
            name: 'avatar.png',
            status: 'done',
            url: avatar
          }]);
        } else if (avatar.url) {
          setFileList([{
            uid: '-1',
            name: 'avatar.png',
            status: 'done',
            url: avatar.url
          }]);
        } else if (avatar.originFileObj) {
          setFileList([{
            uid: avatar.uid || '-1',
            name: avatar.name || 'avatar.png',
            status: 'done',
            originFileObj: avatar.originFileObj,
            url: URL.createObjectURL(avatar.originFileObj)
          }]);
        }
      }
    }
  }, [initialValues, form]);

  // Guardar en localStorage automáticamente
  useEffect(() => {
    const saveUserData = () => {
      const values = form.getFieldsValue();

      let avatarPath = '';
      if (fileList.length > 0) {
        const file = fileList[0];
        if (file.originFileObj) {
          avatarPath = file.name;
        } else if (file.url) {
          avatarPath = file.url;
        }
      }

      const userData = {
        email: values.email || '',
        name: values.firstName || '',
        last_name: values.lastName || '',
        birthdate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : '',
        avatar_path: avatarPath,
        fk_gender_id: values.gender === 'male' ? 1 : values.gender === 'female' ? 2 : 3,
        fk_prospect_id: 0
      };

      localStorage.setItem('prospectUserData', JSON.stringify(userData));
    };

    const unsubscribe = form.subscribe?.(() => {
      saveUserData();
    });

    saveUserData();
  }, [form, fileList]);

  const beforeUpload = (file) => {
    const isImage = file.type?.startsWith('image/');
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

  const validateName = (_, value) => {
    if (!value || /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('Solo se permiten letras y espacios'));
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      let avatarData = null;
      if (fileList.length > 0) {
        const file = fileList[0];
        avatarData = file.originFileObj 
          ? { originFileObj: file.originFileObj }
          : { url: file.url || '' };
      }

      const userData = {
        ...values,
        birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : null,
        avatar: avatarData
      };

      await onNext({ user: userData });
    } catch (error) {
      console.error('Error al guardar datos:', error);
      message.error('Error al guardar los datos del usuario');
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    const currentValues = form.getFieldsValue();

    let avatarData = null;
    if (fileList.length > 0) {
      const file = fileList[0];
      if (file.originFileObj) {
        avatarData = {
          originFileObj: file.originFileObj,
          url: URL.createObjectURL(file.originFileObj)
        };
      } else if (file.url) {
        avatarData = file.url;
      }
    }

    onPrev({ 
      user: {
        ...currentValues,
        birthDate: currentValues.birthDate ? currentValues.birthDate.format('YYYY-MM-DD') : null,
        avatar: avatarData
      }
    });
  };

  return (
    <Card>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          gender: 'male'
        }}
        validateMessages={{
          required: 'Este campo es obligatorio',
          types: {
            email: 'No es un email válido',
          },
        }}
      >
        <h4>Datos necesarios para el administrador de la cuenta</h4>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true },
                { type: 'email' }
              ]}
            >
              <Input 
                placeholder="ejemplo@empresa.com" 
                prefix={<UserOutlined />} 
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="firstName"
              label="Nombre(s)"
              rules={[
                { required: true },
                { min: 2 },
                { max: 50 },
                { validator: validateName }
              ]}
            >
              <Input placeholder="Ingrese su(s) nombre(s)" prefix={<UserOutlined />} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="lastName"
              label="Apellido(s)"
              rules={[
                { required: true },
                { min: 2 },
                { max: 50 },
                { validator: validateName }
              ]}
            >
              <Input placeholder="Ingrese su(s) apellido(s)" prefix={<UserOutlined />} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="gender"
              label="Género"
              rules={[{ required: true }]}
            >
              <Select placeholder="Seleccione su género">
                <Option value="male">Masculino</Option>
                <Option value="female">Femenino</Option>
                <Option value="other">Otro</Option>
                <Option value="unspecified">Prefiero no decir</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="birthDate"
              label="Fecha de Nacimiento"
              rules={[
                { required: true },
                () => ({
                  validator(_, value) {
                    if (!value || value.isBefore(moment().subtract(18, 'years'))) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Debes tener al menos 18 años'));
                  },
                }),
              ]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="Seleccione su fecha de nacimiento" 
                disabledDate={(current) => current && current > moment().endOf('day')}
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="avatar"
          label="Avatar"
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
                <div style={{ marginTop: 8 }}>Subir imagen</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button 
            type="default" 
            onClick={handlePrev} 
            style={{ marginRight: 8 }}
            disabled={loading}
          >
            Anterior (Ubicación)
          </Button>
          <Button 
            type="primary" 
            htmlType="submit"
            loading={loading}
          >
            Siguiente (Datos Fiscales)
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default Step3UserData;
