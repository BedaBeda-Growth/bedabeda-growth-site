const SlackMessages = () => {
  const messages = [
    "My site feels like it's taped together with random widgets.",
    "We don't have a cohesive story throughout our site.",
    "I'm not 'feeling' any of our wins.",
    "The testing ideas feel uncreative."
  ];

  return (
    <div className="max-w-4xl mx-auto mb-12">
      <div className="grid md:grid-cols-2 gap-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 relative"
          >
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">Anonymous User</span>
                  <span className="text-xs text-gray-500">Today at 12:34 PM</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed italic">
                  "{message}"
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlackMessages;