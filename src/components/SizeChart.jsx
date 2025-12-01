// components/SizeChart.jsx
export default function SizeChart({ selectedSize, onSizeChange }) {
  const sizes = [
    { label: 'M', length: '27"' },
    { label: 'L', length: '28"' },
    { label: 'XL', length: '29"' },
    { label: '2XL', length: '30"' }
  ];

  return (
    <section className="size-chart">
      <h2>T-Shirt Measurements</h2>
      
      <div className="size-buttons">
        {sizes.map(size => (
          <button
            key={size.label}
            className={`size-btn ${selectedSize === size.label ? 'active' : ''}`}
            onClick={() => onSizeChange(size.label)}
          >
            {size.label}
          </button>
        ))}
      </div>

      <table className="size-table">
        <thead>
          <tr>
            <th>SIZE</th>
            <th>LENGTH</th>
          </tr>
        </thead>
        <tbody>
          {sizes.map(size => (
            <tr key={size.label}>
              <td>{size.label}</td>
              <td>{size.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}