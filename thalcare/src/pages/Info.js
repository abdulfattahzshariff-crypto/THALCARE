export default function Info() {
  const sections = [
    {
      title: 'What is thalassemia major?',
      items: [
        <>Thalassemia major (beta-thalassemia major) is an inherited blood disorder where the body produces <strong>little or no functional haemoglobin</strong>. Without enough haemoglobin, red blood cells cannot carry oxygen effectively, causing severe anaemia.</>,
        <>It results from mutations in the <strong>HBB gene</strong> on chromosome 11. Both parents must carry the trait for a child to develop the major form.</>
      ]
    },
    {
      title: 'Why regular transfusions?',
      items: [
        <>Transfusions replace defective red blood cells with healthy donor cells. A schedule of <strong>2 pints every 3 weeks</strong> maintains haemoglobin levels high enough to support normal activity and prevent organ damage from chronic anaemia.</>
      ]
    },
    {
      title: 'Iron overload and chelation',
      items: [
        <>Each unit of transfused blood contains about <strong>200–250 mg of iron</strong>. Over time this accumulates in the liver, heart, and endocrine glands — a condition called <em>iron overload</em> or <em>haemosiderosis</em>. Left untreated, it causes organ failure.</>,
        <><strong>Desferrioxamine (DFO)</strong> is an iron chelator — it binds excess iron and removes it through urine and stool. Taking it on an <strong>empty stomach in the morning</strong> improves absorption and effectiveness.</>
      ]
    },
    {
      title: 'Key monitoring targets',
      items: [
        <><strong>Serum ferritin</strong> — measures stored iron. Target: 500–1000 µg/L. Above 2500 µg/L signals significant overload.</>,
        <><strong>Pre-transfusion Hb</strong> — usually kept above 9–10 g/dL to reduce cardiac stress.</>,
        <><strong>Liver iron concentration (LIC)</strong> and <strong>cardiac T2* MRI</strong> — gold standards for iron in organs. Typically done annually.</>
      ]
    },
    {
      title: 'Lifestyle tips',
      items: [
        <>Avoid <strong>iron-rich supplements</strong> and reduce high-iron foods (red meat, iron-fortified cereals). Green tea may modestly reduce iron absorption.</>,
        <>Stay well <strong>hydrated</strong> — DFO works partly through the kidneys. Adequate fluid intake supports chelation.</>,
        <>Watch for <strong>infections</strong> — people with thalassemia major have higher infection risk. Keep vaccinations up to date.</>
      ]
    }
  ]

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 16 }}>About your condition</h2>
      {sections.map(s => (
        <div key={s.title} className="card">
          <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 10 }}>{s.title}</h3>
          {s.items.map((item, i) => (
            <div key={i} className="info-block">{item}</div>
          ))}
        </div>
      ))}
      <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', marginTop: 8 }}>
        This information is for general guidance only. Always follow your doctor's advice.
      </p>
    </div>
  )
}
