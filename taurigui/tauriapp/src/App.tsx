import React, { useCallback, useState } from "react";
import "./App.less";
import { open } from "@tauri-apps/api/dialog";
import { invoke } from "@tauri-apps/api";
import { useContainerSize } from "./lib/hooks";
import { readBinaryFile } from "@tauri-apps/api/fs";
import { Button, Layout, Row, Col, Space } from "antd";

const { Content } = Layout;

const getImageSrc = async (filepath: string) => {
  const blob = new Blob([new Uint8Array(await readBinaryFile(filepath))]);
  return URL.createObjectURL(blob);
};

type AppState = {
  isLoading: boolean;
  isInferred: boolean;
  configYml: string;
  onnxFile: string;
  inferredResult?: InferredResult;
  imageSrc: string;
};

type InferredResult = {
  message: string;
  lap?: string;
};

function App() {
  const [appState, setAppState] = useState<AppState>({
    isLoading: false,
    isInferred: false,
    configYml: "",
    onnxFile: "",
    imageSrc: "",
  });
  const { containerSize, containerRef } = useContainerSize();
  const { width: containerWidth, height: containerHeight } = containerSize;

  const handleClick = async () => {
    const filepath = (await open({
      multiple: false,
      filters: [{ name: "file suffix filter", extensions: ["yml", "onnx"] }],
    })) as string;
    if (!filepath) {
      return;
    }
    setAppState({ ...appState, isLoading: true });
    await invoke("select_file_command", { filepath });
    if (filepath.includes("yml")) {
      setAppState({ ...appState, isLoading: false, configYml: filepath });
    } else if (filepath.includes("onnx")) {
      setAppState({ ...appState, isLoading: false, onnxFile: filepath });
    }
  };

  const checkInferenceReady = useCallback(() => {
    return appState.configYml && appState.onnxFile;
  }, [appState.configYml, appState.onnxFile]);

  const handleInfer = async () => {
    const filepath = (await open({
      multiple: false,
      filters: [
        { name: "image suffix filter", extensions: ["png", "jpg", "jpeg"] },
      ],
    })) as string;
    if (!filepath) {
      return;
    }
    setAppState({
      ...appState,
      isInferred: true,
      inferredResult: undefined,
    });
    const renderImagePromise = getImageSrc(filepath);
    const invokePromise: Promise<InferredResult> = invoke("infer_command", {
      filepath,
    });
    const [inferredResult, imageSrc] = await Promise.all([
      invokePromise,
      renderImagePromise,
    ]);
    setAppState({
      ...appState,
      isInferred: false,
      inferredResult,
      imageSrc,
    });
  };

  return (
    <Layout className="App-layout">
      <Content>
        <Row className="App-row">
          <Col span={16} ref={containerRef}>
            <img
              id="canvas"
              width={containerWidth}
              height={containerHeight}
              src={appState.imageSrc}
            />
          </Col>
          <Col span={8} className="App-text-col">
            <Space direction="vertical">
              <div>
                Config file:
                {appState.configYml ? appState.configYml : "Not selected"}
              </div>
              <div>
                ONNX file:{" "}
                {appState.onnxFile ? appState.onnxFile : "Not selected"}
              </div>
              <Button
                onClick={handleClick}
                type="primary"
                loading={appState.isLoading}
              >
                Select file
              </Button>
              {checkInferenceReady() && (
                <Button
                  onClick={handleInfer}
                  type="default"
                  loading={appState.isInferred}
                >
                  Infer
                </Button>
              )}
              {appState.inferredResult?.message && (
                <div>{appState.inferredResult.message}</div>
              )}
              {appState.inferredResult?.lap && (
                <div className="App-lap">{appState.inferredResult.lap}</div>
              )}
            </Space>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}

export default App;
