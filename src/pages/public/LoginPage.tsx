import React from "react";
import { Form, Input, Button, Checkbox, Alert } from "antd";
import {
  LockOutlined,
  ArrowRightOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { loginUser, clearError } from "../../store/slices/authSlice";
import type { LoginCredentials } from "../../types/auth.types";
import { loginSchema, validateForm } from "../../utils/validators";

const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useAppSelector((state) => state.auth);
  const errorRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (error) {
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [error]);

  // Where to redirect after login
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const onFinish = async (values: LoginCredentials) => {
    // Validate with Yup before dispatch
    const errors = await validateForm(loginSchema, values);
    if (Object.keys(errors).length > 0) {
      form.setFields(
        Object.keys(errors).map((key) => ({
          name: key,
          errors: [errors[key]],
        })),
      );
      return;
    }

    const resultAction = await dispatch(loginUser(values));

    if (loginUser.fulfilled.match(resultAction)) {
      const role = resultAction.payload.user.role as string;
      if (role === "super_admin" || role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/customer", { replace: true });
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex">
      {/* Left Panel - Visual */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-brand-navy flex-col justify-between p-12">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?w=1200&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-navy/80 to-transparent z-0" />

        {/* Top Spacer */}
        <div className="w-12 h-12 bg-white relative z-10" />

        <div className="relative z-10 w-full mb-20">
          <div className="inline-flex items-center px-4 py-1.5 border border-white/20 rounded-full text-white text-[10px] font-bold tracking-[0.2em] uppercase mb-10">
            Secure Access Portal
          </div>

          <h2 className="text-5xl xl:text-6xl font-extrabold text-white leading-tight mb-2 tracking-tight">
            Command Center
          </h2>
          <div className="text-4xl xl:text-5xl font-light italic text-slate-300 mb-8">
            v4.2.0
          </div>

          <p className="text-slate-300 text-lg leading-relaxed max-w-sm mt-6 font-medium">
            Enter your credentials to access the global freight tracking and
            manifest management system. Industrial precision, worldwide reach.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-auto">
          <span>SYS.UP</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-slow" />
          <span>ALL PROTOCOLS ACTIVE</span>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 py-12 px-4 sm:px-8 lg:px-16">
        <div className="w-full max-w-[420px] bg-white p-10 rounded-2xl shadow-xl shadow-slate-200/50">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Sign In</h2>
            <p className="text-slate-500 font-medium text-sm">
              Welcome back. Please enter your details.
            </p>
          </div>

          {error && (
            <div ref={errorRef}>
              <Alert
                message="Login Failed"
                description={error}
                type="error"
                showIcon
                className="mb-6"
                onClose={() => dispatch(clearError())}
                closable
              />
            </div>
          )}

          <Form
            form={form}
            name="login"
            layout="vertical"
            initialValues={{ rememberMe: true }}
            onFinish={onFinish}
            size="large"
            className="space-y-5"
          >
            <Form.Item
              name="email"
              label={
                <span className="text-xs font-bold text-slate-700">
                  Email Address
                </span>
              }
              rules={[{ required: true, message: "Please input your email!" }]}
              className="mb-0"
            >
              <Input
                prefix={<MailOutlined className="text-slate-400 mr-1" />}
                placeholder="operator@globallogistics.com"
                className="!h-12 !rounded-lg !bg-slate-50 !border-slate-200 focus:!bg-white"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <span className="text-xs font-bold text-slate-700">
                  Password
                </span>
              }
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
              className="mb-0"
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-400 mr-1" />}
                placeholder="••••••••"
                className="!h-12 !rounded-lg !bg-slate-50 !border-slate-200 focus:!bg-white"
              />
            </Form.Item>

            <div className="flex items-center justify-between pt-2">
              <Form.Item
                name="rememberMe"
                valuePropName="checked"
                className="mb-0"
              >
                <Checkbox className="text-xs font-bold text-slate-600">
                  Remember for 30 days
                </Checkbox>
              </Form.Item>
              <Link
                to="/forgot-password"
                className="text-brand-navy font-bold hover:text-brand-orange text-xs transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Form.Item className="mb-0 pt-2">
              <Button
                type="primary"
                htmlType="submit"
                className="w-full !h-12 text-sm font-bold !bg-brand-navy hover:!bg-slate-800 !rounded-lg"
                loading={loading}
                icon={<ArrowRightOutlined />}
                iconPlacement="end"
              >
                Authenticate
              </Button>
            </Form.Item>

            <div className="text-center pt-6">
              <span className="text-slate-500 text-sm">
                Don't have access?{" "}
              </span>
              <Link
                to="/register"
                className="text-slate-800 font-bold hover:text-brand-orange text-sm transition-colors"
              >
                Request Account
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export { LoginPage };
export default LoginPage;
