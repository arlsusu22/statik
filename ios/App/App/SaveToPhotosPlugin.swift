import Foundation
import Capacitor
import Photos
import UIKit

@objc(SaveToPhotosPlugin)
public class SaveToPhotosPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SaveToPhotosPlugin"
    public let jsName = "SaveToPhotos"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "saveBase64Image", returnType: CAPPluginReturnPromise)
    ]
    
    @objc func saveBase64Image(_ call: CAPPluginCall) {
        guard let base64String = call.getString("base64") else {
            call.reject("No base64 data provided")
            return
        }
        
        // Remove data URL prefix if present
        let cleanBase64 = base64String
            .replacingOccurrences(of: "data:image/png;base64,", with: "")
            .replacingOccurrences(of: "data:image/jpeg;base64,", with: "")
        
        guard let imageData = Data(base64Encoded: cleanBase64),
              let image = UIImage(data: imageData) else {
            call.reject("Invalid image data")
            return
        }
        
        // Check permission status
        let status = PHPhotoLibrary.authorizationStatus(for: .addOnly)
        
        switch status {
        case .authorized, .limited:
            self.saveImage(image, call: call)
        case .notDetermined:
            PHPhotoLibrary.requestAuthorization(for: .addOnly) { newStatus in
                if newStatus == .authorized || newStatus == .limited {
                    self.saveImage(image, call: call)
                } else {
                    call.reject("Photo library access denied")
                }
            }
        default:
            call.reject("Photo library access denied")
        }
    }
    
    private func saveImage(_ image: UIImage, call: CAPPluginCall) {
        PHPhotoLibrary.shared().performChanges({
            PHAssetChangeRequest.creationRequestForAsset(from: image)
        }) { success, error in
            DispatchQueue.main.async {
                if success {
                    call.resolve(["success": true])
                } else {
                    call.reject(error?.localizedDescription ?? "Failed to save image")
                }
            }
        }
    }
}
