"use client";
import { PlusCircleOutlined, SendOutlined } from "@ant-design/icons";
import { ProChat } from "@ant-design/pro-chat";
import { Button, Form, Input, Space, Upload, message, theme as antTheme } from "antd";
import { ThemeProvider, useTheme } from "antd-style";
import { useEffect, useState } from "react";
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';

export default function Home() {
  const theme = useTheme();
  const [showComponent, setShowComponent] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => setShowComponent(true), []);

  const inputAreaRender = (
    _: React.ReactNode,
    onMessageSend: (message: string) => void | Promise<any>,
    onClear: () => void
  ) => {
    return (
      <Form
        form={form}
        className="max-w-5xl mx-auto px-4 py-4"
        onFinish={async (value) => {
          const { question, files } = value;
          if (!question?.trim()) return;

          const FilesBase64List = files?.fileList.map(
            (file: any) => `![${file.name}](${file.thumbUrl})`
          );
          const Prompt = `${question} ${FilesBase64List?.join("\n") || ""}`;
          await onMessageSend(Prompt);
          form.resetFields();
        }}
      >
        <div className="flex items-center gap-2 w-full">
          <Form.Item name="files" className="mb-0">
            <Upload
              listType="picture-card"
              beforeUpload={(file) => {
                const isAllowed = [
                  "image/png",
                  "image/jpeg",
                  "application/pdf",
                ].includes(file.type);
                if (!isAllowed) {
                  message.error("Please upload PNG, JPEG, or PDF files only");
                  return Upload.LIST_IGNORE;
                }
                return true;
              }}
              action="/api/upload"
              className="bg-transparent"
            >
              <button className="border-0 bg-transparent p-0 cursor-pointer w-8 h-8 flex items-center justify-center">
                <PlusCircleOutlined className="text-2xl text-blue-500" />
              </button>
            </Upload>
          </Form.Item>
          <Form.Item 
            className="flex-1 mb-0 relative" 
            name="question"
          >
            <div className="relative flex items-center">
              <Input.TextArea
                placeholder="Ask me anything"
                autoSize={{ minRows: 2, maxRows: 4 }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    form.submit();
                  }
                }}
                className="resize-none pr-10 rounded-lg bg-transparent border border-gray-600 custom-scrollbar"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#ED4192 transparent',
                }}              />
              <Button
                type="text"
                htmlType="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 border-0 p-1 flex items-center justify-center bg-transparent hover:text-pink-600 hover:bg-gray-500"
              >
                <SendOutlined className="text-base text-blue-500 hover:text-pink-600" />
              </Button>
            </div>
          </Form.Item>
        </div>
      </Form>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      {showComponent && (
        <ThemeProvider
          appearance="dark"
          theme={{
            algorithm: antTheme.darkAlgorithm,
            token: {
              colorPrimary: '#ED4192',
              colorText: '#ffff',
              borderRadius: 20,
            },
          }}
        >
          <ConfigProvider locale={enUS}>
            <div className="bg-black h-screen">
              <ProChat
                className="h-full custom-scrollbar"
                style={{ 
                  height: '100vh', 
                  width: '100vw',
                  overflow: 'auto'
                }}
                locale="en-US"
                inputAreaRender={inputAreaRender}
                request={async (messages) => {
                  const response = await fetch('/api/zaplead', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: messages }),
                  });
                  return response;
                }}
              />
            </div>
          </ConfigProvider>
        </ThemeProvider>
      )}
    </div>
  );
}