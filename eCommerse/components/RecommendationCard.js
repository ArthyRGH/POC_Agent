// No imports in browser-based React
// import React from 'react';
// import './RecommendationCard.css';

function RecommendationCard({ title, description, agent, impact }) {
  const getImpactBadge = () => {
    switch (impact.toLowerCase()) {
      case 'high':
        return <span className="impact-badge high">High Impact</span>;
      case 'medium':
        return <span className="impact-badge medium">Medium Impact</span>;
      case 'low':
        return <span className="impact-badge low">Low Impact</span>;
      default:
        return null;
    }
  };

  const getAgentInitial = () => {
    if (agent.includes('INV')) return 'I';
    if (agent.includes('PRICING')) return 'P';
    if (agent.includes('MARK')) return 'M';
    if (agent.includes('CX')) return 'C';
    return agent.charAt(0);
  };

  const getAgentColor = () => {
    if (agent.includes('INV')) return '#E3F2FD';
    if (agent.includes('PRICING')) return '#E8F5E9';
    if (agent.includes('MARK')) return '#FFF3E0';
    if (agent.includes('CX')) return '#F3E5F5';
    return '#ECEFF1';
  };

  return (
    <div className="recommendation-card">
      <div className="recommendation-left-border"></div>
      
      <div className="recommendation-content">
        <div className="recommendation-header">
          <h3>{title}</h3>
          {getImpactBadge()}
        </div>
        
        <p className="recommendation-description">{description}</p>
        
        <div className="recommendation-footer">
          <div className="agent-info">
            <div className="agent-avatar" style={{ backgroundColor: getAgentColor() }}>
              {getAgentInitial()}
            </div>
            <span>Suggested by {agent}</span>
          </div>
          
          <button className="apply-button">Apply</button>
        </div>
      </div>
    </div>
  );
}

// No export default in browser-based React
// export default RecommendationCard; 