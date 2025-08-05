import { Input } from "../../../components/CommonUI/input"
import { Label } from "../../../components/CommonUI/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/CommonUI/select"

export default function BasicInformationForm({ formData, errors, onChange, emailReadOnly, isOAuthUser, user }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-[#111827] font-medium">
            First Name *
          </Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={e => onChange("firstName", e.target.value)}
            placeholder="John"
            className={`border-gray-200 focus:border-[#4F46E5] focus:ring-[#4F46E5] ${
              errors.firstName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
            }`}
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm">{errors.firstName}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-[#111827] font-medium">
            Last Name *
          </Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={e => onChange("lastName", e.target.value)}
            placeholder="Doe"
            className={`border-gray-200 focus:border-[#4F46E5] focus:ring-[#4F46E5] ${
              errors.lastName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
            }`}
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-[#111827] font-medium">
          Email *
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={e => onChange("email", e.target.value)}
          placeholder="john@example.com"
          className={`border-gray-200 focus:border-[#4F46E5] focus:ring-[#4F46E5] ${
            errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
          }`}
          readOnly={!!emailReadOnly}
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-[#111827] font-medium">
          Phone Number *
        </Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={e => onChange("phone", e.target.value)}
          placeholder="Enter your phone number"
          className={`border-gray-200 focus:border-[#4F46E5] focus:ring-[#4F46E5] ${
            errors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
          }`}
        />
        {errors.phone && (
          <p className="text-red-500 text-sm">{errors.phone}</p>
        )}
      </div>

            {!isOAuthUser && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#111827] font-medium">
              Password *
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={e => onChange("password", e.target.value)}
              className={`border-gray-200 focus:border-[#4F46E5] focus:ring-[#4F46E5] ${
                errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-[#111827] font-medium">
              Confirm Password *
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={e => onChange("confirmPassword", e.target.value)}
              className={`border-gray-200 focus:border-[#4F46E5] focus:ring-[#4F46E5] ${
                errors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="gender" className="text-[#111827] font-medium">
            Gender
          </Label>
          <Select onValueChange={value => onChange("gender", value)} value={formData.gender}>
            <SelectTrigger className="border-gray-200 focus:border-[#4F46E5] focus:ring-[#4F46E5]">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="country" className="text-[#111827] font-medium">
            Country *
          </Label>
          <Input
            id="country"
            value={formData.country}
            onChange={e => onChange("country", e.target.value)}
            placeholder="Enter your country"
            className={`border-gray-200 focus:border-[#4F46E5] focus:ring-[#4F46E5] ${
              errors.country ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
            }`}
          />
          {errors.country && (
            <p className="text-red-500 text-sm">{errors.country}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="city" className="text-[#111827] font-medium">
          City *
        </Label>
        <Input
          id="city"
          value={formData.city}
          onChange={e => onChange("city", e.target.value)}
          placeholder="Enter your city"
          className="border-gray-200 focus:border-[#4F46E5] focus:ring-[#4F46E5]"
        />
      </div>
    </div>
  )
} 