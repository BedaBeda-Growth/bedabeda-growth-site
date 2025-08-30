const SlackMessages = () => {
  const messages = [
    { text: "My site feels like it's taped together with random widgets.", title: "VP of Growth" },
    { text: "We don't have a cohesive story throughout our site.", title: "Head of eCommerce" },
    { text: "My designers & devs don't think like performance marketers.", title: "Director of Marketing" },
    { text: "The testing ideas feel uncreative.", title: "CEO & Co-Founder" }
  ];

  return (
    <div className="max-w-4xl mx-auto mb-12">
      <div className="grid md:grid-cols-2 gap-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 relative text-center"
          >
            <div className="space-y-3">
              <span className="text-sm font-semibold text-gray-900 block">{message.title}</span>
              <p className="text-gray-700 text-sm leading-relaxed italic">
                "{message.text}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlackMessages;