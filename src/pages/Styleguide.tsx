import { useState } from "react";
import { Plus, Calendar, ChevronLeft, Trash2 } from "lucide-react";
import {
  Button,
  IconButton,
  Card,
  Badge,
  Chip,
  TextField,
  Textarea,
  Select,
  FormField,
  FormSection,
  Toggle,
  SearchInput,
  Tabs,
  Modal,
  Drawer,
} from "../components/primitives";
import "./Styleguide.css";

const TOKENS = [
  "--accent",
  "--accent-light",
  "--success",
  "--warning",
  "--danger",
  "--whatsapp",
  "--bg",
  "--card-bg",
  "--text-primary",
  "--text-secondary",
  "--text-muted",
  "--border",
];

function Row({ children }: { children: React.ReactNode }) {
  return <div className="sg-row">{children}</div>;
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="sg-block">
      <h2 className="sg-block__title">{title}</h2>
      {children}
    </section>
  );
}

export default function Styleguide() {
  const [tab, setTab] = useState("month");
  const [ftab, setFtab] = useState("fase1");
  const [on, setOn] = useState(true);
  const [chip, setChip] = useState("a");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="sg-page">
      <h1 className="sg-title">MoveCare Design System</h1>
      <p className="sg-sub">
        Living reference for tokens &amp; primitives. Compose these — don't write new component CSS.
      </p>

      <Block title="Color tokens">
        <Row>
          {TOKENS.map((t) => (
            <div key={t} className="sg-swatch">
              <span className="sg-swatch__chip" style={{ background: `var(${t})` }} />
              <code>{t}</code>
            </div>
          ))}
        </Row>
      </Block>

      <Block title="Button — variants">
        <Row>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="primary" disabled>Disabled</Button>
          <Button variant="primary" loading>Loading</Button>
        </Row>
      </Block>

      <Block title="Button — sizes & icons">
        <Row>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button iconLeft={<Plus size={16} />}>With icon</Button>
        </Row>
      </Block>

      <Block title="IconButton">
        <Row>
          <IconButton label="Back" icon={<ChevronLeft size={20} />} variant="subtle" />
          <IconButton label="Add" icon={<Plus size={18} />} variant="outline" shape="circle" />
          <IconButton label="Delete" icon={<Trash2 size={18} />} variant="ghost" />
        </Row>
      </Block>

      <Block title="Card">
        <Row>
          <Card>Static card</Card>
          <Card interactive>Interactive (hover)</Card>
          <Card radius="lg" padding="lg">Large radius / padding</Card>
        </Row>
      </Block>

      <Block title="Badge">
        <Row>
          <Badge tone="neutral">Neutral</Badge>
          <Badge tone="accent">Accent</Badge>
          <Badge tone="success">Ativo</Badge>
          <Badge tone="warning">Avaliação</Badge>
          <Badge tone="danger">Alta</Badge>
          <Badge color="#AF52DE">Mobilidade</Badge>
        </Row>
      </Block>

      <Block title="Chip (selectable)">
        <Row>
          {["a", "b", "c"].map((c) => (
            <Chip key={c} selected={chip === c} onClick={() => setChip(c)}>
              Opção {c.toUpperCase()}
            </Chip>
          ))}
          <Chip tone="success" selected>Success</Chip>
          <Chip tone="warning" selected>Warning</Chip>
        </Row>
      </Block>

      <Block title="Tabs">
        <Row>
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { value: "month", label: "Mês" },
              { value: "week", label: "Semana" },
              { value: "day", label: "Dia" },
            ]}
          />
        </Row>
        <Row>
          <Tabs
            variant="flat"
            value={ftab}
            onChange={setFtab}
            items={[
              { value: "fase1", label: "Fase 1" },
              { value: "fase2", label: "Fase 2" },
              { value: "fase3", label: "Fase 3" },
            ]}
          />
        </Row>
      </Block>

      <Block title="Toggle">
        <Row>
          <Toggle checked={on} onChange={setOn} />
          <Toggle
            checked={on}
            onChange={setOn}
            label="Exercício em casa"
            description="Disponível no app do paciente"
          />
        </Row>
      </Block>

      <Block title="SearchInput">
        <Row>
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            width={240}
          />
        </Row>
      </Block>

      <Block title="Form primitives">
        <FormSection title="Dados do paciente" icon={<Calendar size={16} />}>
          <FormField label="Nome" required htmlFor="sg-nome">
            <TextField id="sg-nome" placeholder="Nome completo" />
          </FormField>
          <FormField label="Condição" htmlFor="sg-cond">
            <Select id="sg-cond" defaultValue="">
              <option value="" disabled>Selecione</option>
              <option>Pós-operatório</option>
              <option>Neurológico</option>
            </Select>
          </FormField>
          <FormField label="E-mail" htmlFor="sg-mail" error="E-mail inválido">
            <TextField id="sg-mail" error defaultValue="invalido@" />
          </FormField>
          <FormField label="Telefone" hint="Com DDD" htmlFor="sg-tel">
            <TextField id="sg-tel" placeholder="(00) 00000-0000" />
          </FormField>
          <FormField label="Observações" colSpan={2} htmlFor="sg-obs">
            <Textarea id="sg-obs" placeholder="Notas..." />
          </FormField>
        </FormSection>
      </Block>

      <Block title="Overlays">
        <Row>
          <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          <Button variant="secondary" onClick={() => setDrawerOpen(true)}>Open Drawer</Button>
        </Row>
      </Block>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Exemplo de modal"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={() => setModalOpen(false)}>Confirmar</Button>
          </>
        }
      >
        <p>Conteúdo do modal. Esc ou clique fora para fechar.</p>
      </Modal>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Painel lateral">
        <p>Conteúdo do drawer.</p>
      </Drawer>
    </div>
  );
}
