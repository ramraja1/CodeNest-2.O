function ConfirmModal({ message, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-black/20 to-white/10 backdrop-blur-sm flex justify-center items-center z-50">
    <div className="bg-white rounded-lg p-6 shadow-lg w-80">
          <h2 className="text-lg font-semibold mb-4">{message}</h2>
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }
  export default ConfirmModal