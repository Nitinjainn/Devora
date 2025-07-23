import React, { useRef, useState, useCallback } from "react"
import { ArrowLeft, Plus, Upload, Save, Eye, Trash2, Type } from "lucide-react"

function getAverageColor(img, x, y, w, h) {
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  ctx.drawImage(img, x, y, w, h, 0, 0, w, h)
  const data = ctx.getImageData(0, 0, w, h).data
  let r = 0,
    g = 0,
    b = 0
  for (let i = 0; i < data.length; i += 4) {
    r += data[i]
    g += data[i + 1]
    b += data[i + 2]
  }
  const count = data.length / 4
  return {
    r: Math.round(r / count),
    g: Math.round(g / count),
    b: Math.round(b / count)
  }
}

function getContrastYIQ({ r, g, b }) {
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 128 ? "#222" : "#fff"
}

// Custom draggable and resizable text field component
function DraggableTextField({
  field,
  onUpdate,
  onSelect,
  isSelected,
  isPreview,
  onFocus,
  canvasRef,
  imgRef
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 })
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 })
  const fieldRef = useRef(null)

  // Helper function to get field position relative to image
  const getImageRelativePosition = useCallback(() => {
    if (!imgRef.current || !canvasRef.current)
      return { x: 0, y: 0, width: 0, height: 0 }

    const canvasRect = canvasRef.current.getBoundingClientRect()
    const imgRect = imgRef.current.getBoundingClientRect()

    // Calculate the offset of the image within the canvas
    const imgOffsetX = imgRect.left - canvasRect.left
    const imgOffsetY = imgRect.top - canvasRect.top

    // Calculate scale factors
    const scaleX = imgRef.current.naturalWidth / imgRect.width
    const scaleY = imgRef.current.naturalHeight / imgRect.height

    // Convert field position to image coordinates
    const imageRelativeX = Math.round((field.x - imgOffsetX) * scaleX)
    const imageRelativeY = Math.round((field.y - imgOffsetY) * scaleY)
    const imageRelativeWidth = Math.round(field.width * scaleX)
    const imageRelativeHeight = Math.round(field.height * scaleY)

    return {
      x: Math.max(0, imageRelativeX),
      y: Math.max(0, imageRelativeY),
      width: imageRelativeWidth,
      height: imageRelativeHeight
    }
  }, [field, imgRef, canvasRef])

  const handleMouseDown = useCallback(
    e => {
      if (isPreview) return

      const rect = fieldRef.current.getBoundingClientRect()
      const canvasRect = canvasRef.current.getBoundingClientRect()

      // Check if clicking on resize handles
      const handleSize = 8
      const rightEdge = rect.right - canvasRect.left
      const bottomEdge = rect.bottom - canvasRect.top
      const leftEdge = rect.left - canvasRect.left
      const topEdge = rect.top - canvasRect.top

      const mouseX = e.clientX - canvasRect.left
      const mouseY = e.clientY - canvasRect.top

      // Check for resize handles
      if (isSelected) {
        if (
          mouseX >= rightEdge - handleSize &&
          mouseY >= bottomEdge - handleSize
        ) {
          setIsResizing(true)
          setResizeHandle("se")
          setDragStart({ x: e.clientX, y: e.clientY })
          setInitialSize({ width: field.width, height: field.height })
          e.preventDefault()
          return
        }
      }

      // Regular drag
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
      setInitialPos({ x: field.x, y: field.y })
      onSelect(field.id)
      e.preventDefault()
    },
    [field, isSelected, isPreview, onSelect, canvasRef]
  )

  const handleMouseMove = useCallback(
    e => {
      if (!isDragging && !isResizing) return

      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y

      if (isResizing) {
        const newWidth = Math.max(50, initialSize.width + deltaX)
        const newHeight = Math.max(20, initialSize.height + deltaY)
        onUpdate(field.id, { width: newWidth, height: newHeight })
      } else if (isDragging) {
        const newX = Math.max(0, initialPos.x + deltaX)
        const newY = Math.max(0, initialPos.y + deltaY)
        onUpdate(field.id, { x: newX, y: newY })
      }
    },
    [
      isDragging,
      isResizing,
      dragStart,
      initialPos,
      initialSize,
      field.id,
      onUpdate
    ]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
    setResizeHandle(null)
  }, [])

  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp])

  // Expose the image relative position calculation
  React.useEffect(() => {
    if (field.getImageRelativePosition) {
      field.getImageRelativePosition = getImageRelativePosition
    }
  }, [getImageRelativePosition, field])

  return (
    <div
      ref={fieldRef}
      className={`absolute cursor-move select-none ${
        isSelected ? "ring-2 ring-indigo-500" : ""
      }`}
      style={{
        left: field.x,
        top: field.y,
        width: field.width,
        height: field.height,
        zIndex: 10
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        contentEditable={!isPreview}
        suppressContentEditableWarning
        className={`px-2 py-1 cursor-text focus:outline-none transition-all duration-200 ${
          !isPreview
            ? "hover:ring-2 hover:ring-indigo-300 hover:ring-opacity-50"
            : ""
        }`}
        style={{
          fontSize: field.fontSize,
          fontFamily: field.fontFamily,
          fontWeight: field.fontWeight,
          textAlign: field.textAlign,
          minHeight: "1.5em",
          height: "100%",
          width: "100%",
          overflowWrap: "break-word",
          whiteSpace: "pre-wrap",
          color: field.color,
          backgroundColor: "transparent",
          border: isSelected ? "2px solid #6366f1" : "1px solid transparent",
          borderRadius: "4px"
        }}
        onFocus={e => {
          if (!isPreview) {
            onSelect(field.id)
            onFocus(field, e.target)
          }
        }}
        onBlur={e => {
          if (!isPreview) {
            const value = e.target.innerText.trim()
            onUpdate(field.id, { content: value || "Sample Text" })
          }
        }}
        onClick={e => {
          if (!isPreview) {
            onSelect(field.id)
            e.stopPropagation()
          }
        }}
      >
        {field.content}
      </div>

      {/* Resize Handle */}
      {isSelected && !isPreview && (
        <div
          className="absolute -bottom-1 -right-1 w-3 h-3 bg-indigo-500 border-2 border-white rounded-full cursor-se-resize"
          onMouseDown={e => {
            e.stopPropagation()
            setIsResizing(true)
            setResizeHandle("se")
            setDragStart({ x: e.clientX, y: e.clientY })
            setInitialSize({ width: field.width, height: field.height })
          }}
        />
      )}
    </div>
  )
}

export default function CertificateEditor({ onBack }) {
  const [fields, setFields] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedField, setSelectedField] = useState(null)
  const [isPreview, setIsPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [certificateTitle, setCertificateTitle] = useState("")
  const [certificateDescription, setCertificateDescription] = useState("")
  const [newFieldName, setNewFieldName] = useState("")
  const imgRef = useRef(null)
  const canvasRef = useRef(null)

  // Helper function to get field position relative to image
  const getImageRelativePosition = useCallback(field => {
    if (!imgRef.current || !canvasRef.current)
      return { x: 0, y: 0, width: 0, height: 0 }

    const canvasRect = canvasRef.current.getBoundingClientRect()
    const imgRect = imgRef.current.getBoundingClientRect()

    // Calculate the offset of the image within the canvas
    const imgOffsetX = imgRect.left - canvasRect.left
    const imgOffsetY = imgRect.top - canvasRect.top

    // Calculate scale factors
    const scaleX = imgRef.current.naturalWidth / imgRect.width
    const scaleY = imgRef.current.naturalHeight / imgRect.height

    // Convert field position to image coordinates
    const imageRelativeX = Math.round((field.x - imgOffsetX) * scaleX)
    const imageRelativeY = Math.round((field.y - imgOffsetY) * scaleY)
    const imageRelativeWidth = Math.round(field.width * scaleX)
    const imageRelativeHeight = Math.round(field.height * scaleY)

    return {
      x: Math.max(0, imageRelativeX),
      y: Math.max(0, imageRelativeY),
      width: imageRelativeWidth,
      height: imageRelativeHeight
    }
  }, [])

  // Helper to convert file to base64
  const fileToBase64 = file =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result) // base64 string
      reader.onerror = error => reject(error)
      reader.readAsDataURL(file)
    })

  const handleImageUpload = async e => {
    const file = e.target.files[0]
    if (file) {
      const base64 = await fileToBase64(file)
      setSelectedImage(base64)
    }
  }

  const addField = (fieldName = "Text Field") => {
    const newField = {
      id: Date.now(),
      label: fieldName,
      x: 100,
      y: 100,
      width: 200,
      height: 40,
      fontSize: 20,
      content: fieldName === "Text Field" ? "Sample Text" : fieldName,
      color: "#222",
      fontFamily: "Arial, sans-serif",
      fontWeight: "normal",
      textAlign: "center"
    }
    setFields([...fields, newField])
    setSelectedField(newField.id)
  }

  const updateField = (id, updates) => {
    setFields(fields.map(f => (f.id === id ? { ...f, ...updates } : f)))
  }

  const handleAddField = () => {
    const fieldName = newFieldName.trim() || "Text Field"
    addField(fieldName)
    setNewFieldName("")
  }

  const updateFieldLabel = (id, newLabel) => {
    setFields(fields.map(f => (f.id === id ? { ...f, label: newLabel } : f)))
  }

  const removeField = id => {
    setFields(fields.filter(f => f.id !== id))
    setSelectedField(null)
  }

  const handleFieldFocus = (field, ref) => {
    const imgEl = imgRef.current
    if (!imgEl || !imgEl.complete) return

    const imgRect = imgEl.getBoundingClientRect()
    const fieldRect = ref.getBoundingClientRect()
    const scaleX = imgEl.naturalWidth / imgRect.width
    const scaleY = imgEl.naturalHeight / imgRect.height

    const x = Math.max(0, Math.round((fieldRect.left - imgRect.left) * scaleX))
    const y = Math.max(0, Math.round((fieldRect.top - imgRect.top) * scaleY))
    const w = Math.max(1, Math.round(fieldRect.width * scaleX))
    const h = Math.max(1, Math.round(fieldRect.height * scaleY))

    const avg = getAverageColor(imgEl, x, y, w, h)
    const color = getContrastYIQ(avg)
    updateField(field.id, { color })
  }

  const handleSave = async () => {
    if (!selectedImage || !certificateTitle.trim()) {
      alert(
        "Please upload a certificate image and enter a title before saving."
      )
      return
    }

    setIsSaving(true)

    try {
      const token = localStorage.getItem("token") // or sessionStorage or your auth context

      if (!token) {
        alert("You are not logged in. Please log in first.")
        setIsSaving(false)
        return
      }

      // Ensure all required field properties are present
      const mappedFields = fields.map(f => ({
        label: f.label || "Text Field",
        x: f.x,
        y: f.y,
        width: f.width,
        height: f.height,
        fontSize: f.fontSize,
        fontFamily: f.fontFamily,
        fontWeight: f.fontWeight,
        textAlign: f.textAlign,
        color: f.color,
        content: f.content || "Sample Text"
      }))

      const certificateData = {
        title: certificateTitle,
        description: certificateDescription,
        preview: selectedImage,
        fields: mappedFields,
        createdAt: new Date().toISOString()
      }

      const response = await fetch(
        "http://localhost:3000/api/certificate-pages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` // ✅ send the JWT token
          },
          body: JSON.stringify(certificateData)
        }
      )

      if (response.ok) {
        alert("Certificate template saved successfully!")
        onBack && onBack()
      } else {
        const err = await response.json()
        throw new Error(err?.message || "Failed to save certificate")
      }
    } catch (error) {
      console.error("Error saving certificate:", error)
      alert("Failed to save certificate. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCanvasClick = e => {
    if (isPreview) return

    // Only deselect if clicking on the canvas background
    if (e.target === canvasRef.current) {
      setSelectedField(null)
    }
  }

  const selectedFieldData = fields.find(f => f.id === selectedField)
  const imageRelativePosition = selectedFieldData
    ? getImageRelativePosition(selectedFieldData)
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 p-4">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-white/80 rounded-lg transition-all duration-200 shadow-sm border border-gray-200"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Certificate Editor
            </h1>
            <p className="text-gray-600 mt-1">
              Create and customize your certificate template
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm border border-gray-200"
          >
            <Eye className="h-5 w-5" />
            {isPreview ? "Edit" : "Preview"}
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving || !selectedImage || !certificateTitle.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            <Save className="h-5 w-5" />
            {isSaving ? "Saving..." : "Save Template"}
          </button>
        </div>
      </div>

      {/* Certificate Details Form */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Template Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certificate Title *
            </label>
            <input
              type="text"
              value={certificateTitle}
              onChange={e => setCertificateTitle(e.target.value)}
              placeholder="e.g., Hackathon Winner Certificate"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={certificateDescription}
              onChange={e => setCertificateDescription(e.target.value)}
              placeholder="Brief description of the certificate"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Certificate Canvas */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Certificate Canvas
              </h2>
              <div className="flex gap-2">
                <label className="inline-flex items-center gap-2 cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm">
                  <Upload className="h-4 w-4" />
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={handleAddField}
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Text
                </button>
              </div>
            </div>

            <div
              ref={canvasRef}
              className="relative border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl overflow-hidden"
              style={{ width: "100%", maxWidth: 1000, height: 600 }}
              onClick={handleCanvasClick}
            >
              {!selectedImage && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Upload a certificate template to get started
                    </p>
                  </div>
                </div>
              )}

              {selectedImage && (
                <img
                  ref={imgRef}
                  src={selectedImage}
                  alt="Certificate Template"
                  className="w-full h-full object-contain"
                  style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}
                />
              )}

              {/* Text Fields */}
              {fields.map(field => (
                <DraggableTextField
                  key={field.id}
                  field={field}
                  onUpdate={updateField}
                  onSelect={setSelectedField}
                  isSelected={selectedField === field.id}
                  isPreview={isPreview}
                  onFocus={handleFieldFocus}
                  canvasRef={canvasRef}
                  imgRef={imgRef}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        {!isPreview && (
          <div className="w-80 space-y-4">
            {/* Add Field Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Add New Field
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Field Name
                  </label>
                  <input
                    type="text"
                    value={newFieldName}
                    onChange={e => setNewFieldName(e.target.value)}
                    placeholder="e.g., Participant Name, Event Title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    onKeyPress={e => e.key === "Enter" && handleAddField()}
                  />
                </div>
                <button
                  onClick={handleAddField}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Field
                </button>
              </div>
            </div>

            {/* Fields List */}
            {fields.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Fields ({fields.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {fields.map(field => (
                    <div
                      key={field.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedField === field.id
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedField(field.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 truncate">
                            {field.label}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {field.content}
                          </p>
                        </div>
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            removeField(field.id)
                          }}
                          className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Properties Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Properties
              </h3>

              {selectedFieldData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-700">
                      {selectedFieldData.label}
                    </h4>
                    <button
                      onClick={() => removeField(selectedFieldData.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Field Name Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Field Name
                    </label>
                    <input
                      type="text"
                      value={selectedFieldData.label}
                      onChange={e =>
                        updateFieldLabel(selectedFieldData.id, e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Live Position & Size Info */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h5 className="font-medium text-gray-700 mb-3">
                      Position & Size (Image Relative)
                    </h5>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>
                        <label className="font-medium block mb-1">X</label>
                        <div className="bg-white px-2 py-1 rounded border">
                          {imageRelativePosition?.x || 0}px
                        </div>
                      </div>
                      <div>
                        <label className="font-medium block mb-1">Y</label>
                        <div className="bg-white px-2 py-1 rounded border">
                          {imageRelativePosition?.y || 0}px
                        </div>
                      </div>
                      <div>
                        <label className="font-medium block mb-1">Width</label>
                        <div className="bg-white px-2 py-1 rounded border">
                          {imageRelativePosition?.width || 0}px
                        </div>
                      </div>
                      <div>
                        <label className="font-medium block mb-1">Height</label>
                        <div className="bg-white px-2 py-1 rounded border">
                          {imageRelativePosition?.height || 0}px
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Font Size
                    </label>
                    <input
                      type="range"
                      min="8"
                      max="72"
                      value={selectedFieldData.fontSize}
                      onChange={e =>
                        updateField(selectedFieldData.id, {
                          fontSize: parseInt(e.target.value)
                        })
                      }
                      className="w-full"
                    />
                    <span className="text-sm text-gray-500">
                      {selectedFieldData.fontSize}px
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Font Family
                    </label>
                    <select
                      value={selectedFieldData.fontFamily}
                      onChange={e =>
                        updateField(selectedFieldData.id, {
                          fontFamily: e.target.value
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="Arial, sans-serif">Arial</option>
                      <option value="Times New Roman, serif">
                        Times New Roman
                      </option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="Helvetica, sans-serif">Helvetica</option>
                      <option value="Courier New, monospace">
                        Courier New
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Font Weight
                    </label>
                    <select
                      value={selectedFieldData.fontWeight}
                      onChange={e =>
                        updateField(selectedFieldData.id, {
                          fontWeight: e.target.value
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                      <option value="lighter">Light</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Text Align
                    </label>
                    <select
                      value={selectedFieldData.textAlign}
                      onChange={e =>
                        updateField(selectedFieldData.id, {
                          textAlign: e.target.value
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Text Color
                    </label>
                    <input
                      type="color"
                      value={selectedFieldData.color}
                      onChange={e =>
                        updateField(selectedFieldData.id, {
                          color: e.target.value
                        })
                      }
                      className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Type className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {fields.length === 0
                      ? "Add a field to get started"
                      : "Select a field to edit its properties"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
