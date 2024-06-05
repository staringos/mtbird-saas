import React, { useMemo } from "react";
import Input from "./InputComponent/Component";
import {
  IExtraConfigFormType,
  IExtraConfigSchema,
  IExtraConfigSchemaConfigType,
} from "../../types/entities/Application";
import Additional from "./AdditionalForm";
import AssistantSelect from "./AssistantSelect";
import Upload from "./Upload";
import { Col, Row as RowAntd } from "antd";
import styles from "./index.module.less";
import clsx from "@/utils/clsx";
import { Collapse } from "antd";

const { Panel } = Collapse;

type Props = {
  schema?: IExtraConfigSchema[];
  metadata?: Record<string, any>;
  onChange?: (key: string, value: any) => void;
};

const FormMap = {
  [IExtraConfigFormType.AssistantSelect]: AssistantSelect,
  [IExtraConfigFormType.Input]: Input,
  [IExtraConfigFormType.Upload]: Upload,
};

const AppTemplateMeta = ({ schema, metadata, onChange }: Props) => {
  const finalSchema = useMemo(() => {
    const processed: {
      [key in IExtraConfigSchemaConfigType]?: IExtraConfigSchema[];
    } = {};

    schema?.map((s) => {
      const type = s.configType || IExtraConfigSchemaConfigType.Basic;
      if (!processed[type]) processed[type] = [];
      processed[type]?.push(s);
    });

    return processed;
  }, [schema]);

  if (!schema?.length) return null;

  return (
    <div>
      <div>
        {finalSchema.basic?.map((item) => {
          const Component = FormMap[item.formType];
          return (
            <Row
              key={item.key}
              schema={item}
              Component={Component}
              data={metadata}
              onChange={onChange}
            />
          );
        })}
      </div>
      <div className={styles.advanced}>
        {finalSchema?.advanced?.length && (
          <Collapse bordered={false}>
            <Panel header={
              <RowAntd>
                <Col span={8}><span>高级配置</span></Col>
              </RowAntd>
            } key="1">
              {finalSchema?.advanced?.map((item) => {
                const Component = FormMap[item.formType];

                return (
                  <Row
                    key={item.key}
                    schema={item}
                    Component={Component}
                    data={metadata}
                    onChange={onChange}
                  />
                );
              })}
            </Panel>
          </Collapse>
        )}
      </div>
    </div>
  );
};

type RowProps = {
  schema: IExtraConfigSchema;
  data?: Record<string, any>;
  Component: React.FC<any>;
  onChange?: (key: string, value: any) => void;
};

const Row = ({ schema, data, Component, onChange }: RowProps) => {
  return (
    <RowAntd className={styles.formRow}>
      <Col
        span={8}
        className={clsx(styles.label, {
          [styles.required]: schema.required,
        })}
      >
        <span>{schema.label}:</span>
      </Col>
      <Col span={16}>
        <Additional type={schema.formType} formKey={schema.key}>
          <Component
            value={data?.[schema.key]}
            onChange={(evt: any) => {
              onChange?.(schema.key, evt?.target?.value || evt);
            }}
          />
        </Additional>
      </Col>
    </RowAntd>
  );
};

export default AppTemplateMeta;
