"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Linha = { nome: string; partido: string; percentual: string };

export default function NovaPesquisa() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [instituto, setInstituto] = useState("");
  const [contratante, setContratante] = useState("");
  const [cargo, setCargo] = useState("governador");
  const [abrangencia, setAbrangencia] = useState("PE");
  const [municipio, setMunicipio] = useState("");
  const [dataCampoInicio, setDataCampoInicio] = useState("");
  const [dataCampoFim, setDataCampoFim] = useState("");
  const [dataDivulgacao, setDataDivulgacao] = useState("");
  const [amostra, setAmostra] = useState("");
  const [margemErro, setMargemErro] = useState("");
  const [fonteUrl, setFonteUrl] = useState("");
  const [tipoCenario, setTipoCenario] = useState("estimulada");

  const [linhas, setLinhas] = useState<Linha[]>([
    { nome: "", partido: "", percentual: "" },
    { nome: "", partido: "", percentual: "" },
  ]);

  function updateLinha(i: number, field: keyof Linha, value: string) {
    setLinhas((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));
  }

  function addLinha() {
    setLinhas((prev) => [...prev, { nome: "", partido: "", percentual: "" }]);
  }

  function removeLinha(i: number) {
    setLinhas((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const validas = linhas.filter((l) => l.nome && l.percentual);
      if (validas.length === 0) throw new Error("Adicione ao menos um candidato com percentual.");

      // upsert candidatos, coletando os IDs
      const resultados = [];
      for (const l of validas) {
        const res = await fetch("/api/candidatos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome: l.nome, partido: l.partido }),
        });
        if (!res.ok) throw new Error("Erro ao salvar candidato: " + l.nome);
        const candidato = await res.json();
        resultados.push({ candidatoId: candidato.id, percentual: l.percentual });
      }

      const pesquisaRes = await fetch("/api/pesquisas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pesquisa: {
            instituto,
            contratante,
            cargo,
            abrangencia,
            municipio: abrangencia !== "BR" && abrangencia !== "PE" ? abrangencia : municipio,
            dataCampoInicio,
            dataCampoFim,
            dataDivulgacao,
            amostra,
            margemErro,
            fonteUrl,
          },
          cenarios: [{ tipo: tipoCenario, resultados }],
        }),
      });

      if (!pesquisaRes.ok) {
        const data = await pesquisaRes.json();
        throw new Error(data.error || "Erro ao salvar pesquisa.");
      }

      setSuccess(true);
      setTimeout(() => router.push("/admin"), 900);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-shell">
      <p className="masthead-sub">Novo registro</p>
      <h1>Cadastrar pesquisa</h1>

      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">Pesquisa salva com sucesso.</p>}

      <form onSubmit={handleSubmit}>
        <div className="row2">
          <div className="field">
            <label>Instituto</label>
            <input value={instituto} onChange={(e) => setInstituto(e.target.value)} required />
          </div>
          <div className="field">
            <label>Contratante (opcional)</label>
            <input value={contratante} onChange={(e) => setContratante(e.target.value)} />
          </div>
        </div>

        <div className="row2">
          <div className="field">
            <label>Cargo</label>
            <select value={cargo} onChange={(e) => setCargo(e.target.value)}>
              <option value="presidente">Presidente</option>
              <option value="governador">Governador</option>
              <option value="senador">Senador</option>
              <option value="prefeito">Prefeito</option>
              <option value="deputado federal">Deputado Federal</option>
              <option value="deputado estadual">Deputado Estadual</option>
            </select>
          </div>
          <div className="field">
            <label>Abrangência</label>
            <select value={abrangencia} onChange={(e) => setAbrangencia(e.target.value)}>
              <option value="BR">Brasil</option>
              <option value="PE">Pernambuco (estado)</option>
              <option value="municipio">Município específico</option>
            </select>
          </div>
        </div>

        {abrangencia === "municipio" && (
          <div className="field">
            <label>Nome do município</label>
            <input value={municipio} onChange={(e) => setMunicipio(e.target.value)} />
          </div>
        )}

        <div className="row2">
          <div className="field">
            <label>Início do campo</label>
            <input
              type="date"
              value={dataCampoInicio}
              onChange={(e) => setDataCampoInicio(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Fim do campo</label>
            <input
              type="date"
              value={dataCampoFim}
              onChange={(e) => setDataCampoFim(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="row2">
          <div className="field">
            <label>Data de divulgação</label>
            <input
              type="date"
              value={dataDivulgacao}
              onChange={(e) => setDataDivulgacao(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Tipo de cenário</label>
            <select value={tipoCenario} onChange={(e) => setTipoCenario(e.target.value)}>
              <option value="estimulada">Estimulada</option>
              <option value="espontanea">Espontânea</option>
              <option value="rejeicao">Rejeição</option>
            </select>
          </div>
        </div>

        <div className="row2">
          <div className="field">
            <label>Amostra (nº entrevistados)</label>
            <input value={amostra} onChange={(e) => setAmostra(e.target.value)} />
          </div>
          <div className="field">
            <label>Margem de erro (pp)</label>
            <input value={margemErro} onChange={(e) => setMargemErro(e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label>Link da fonte / registro</label>
          <input value={fonteUrl} onChange={(e) => setFonteUrl(e.target.value)} />
        </div>

        <p className="cenario-label" style={{ marginTop: 20 }}>
          Candidatos e percentuais
        </p>

        {linhas.map((l, i) => (
          <div className="candidato-line" key={i}>
            <input
              placeholder="Nome do candidato"
              value={l.nome}
              onChange={(e) => updateLinha(i, "nome", e.target.value)}
            />
            <input
              placeholder="Partido"
              value={l.partido}
              onChange={(e) => updateLinha(i, "partido", e.target.value)}
            />
            <input
              placeholder="%"
              value={l.percentual}
              onChange={(e) => updateLinha(i, "percentual", e.target.value)}
              style={{ width: 70 }}
            />
            <button
              type="button"
              className="btn-secondary btn"
              onClick={() => removeLinha(i)}
            >
              x
            </button>
          </div>
        ))}

        <button type="button" className="btn btn-secondary" onClick={addLinha} style={{ marginBottom: 20 }}>
          + Adicionar candidato
        </button>

        <div>
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? "Salvando..." : "Salvar pesquisa"}
          </button>
        </div>
      </form>
    </div>
  );
}
