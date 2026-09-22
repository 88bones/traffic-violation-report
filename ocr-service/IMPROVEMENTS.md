# OCR Accuracy Improvements

## Issues Fixed

### 1. **Low Confidence Threshold (40% → 55%)**
- **Problem**: Accepting predictions with only 40% confidence led to many incorrect characters
- **Solution**: Raised minimum confidence to 55% and made it configurable
- **Impact**: Reduces false positives significantly

### 2. **Aggressive Preprocessing**
- **Problem**: High denoising strength (h=10) and CLAHE settings blurred character edges
- **Solution**: 
  - Reduced denoising from h=10 to h=7
  - Reduced CLAHE clipLimit from 3.0 to 2.5
- **Impact**: Better character edge preservation

### 3. **Fixed Character Segmentation Thresholds**
- **Problem**: Static area threshold (300 pixels) didn't scale with image resolution
- **Solution**: Changed to relative thresholds based on image dimensions:
  - `min_area = h_img * w_img * 0.005` (0.5% of image)
  - `max_area = h_img * w_img * 0.25` (25% of image)
- **Impact**: Better adaptation to different image sizes

### 4. **Improved Character Filtering**
- **Problem**: Overly strict aspect ratio and dimension constraints rejected valid characters
- **Solution**:
  - Relaxed aspect ratio from 0.4 to 0.5-4.0 range
  - Added upper bound for aspect ratio (4.0)
  - Added minimum solidity check (0.3)
  - Adjusted height constraints (0.2-0.95 instead of 0.15-0.9)
- **Impact**: Captures more valid characters while filtering noise

### 5. **Reduced Top Crop (30% → 25%)**
- **Problem**: Fixed 30% crop could cut off characters on some plates
- **Solution**: Reduced to 25% and made it configurable via API
- **Impact**: Less character loss from cropping

### 6. **Better Logging & Feedback**
- **Problem**: Limited visibility into what's happening during recognition
- **Solution**: Added detailed logging:
  - Character candidate count vs accepted count
  - Individual character confidences with rejection reasons
  - Average confidence statistics
- **Impact**: Easier debugging and tuning

## API Enhancements

The `/predict` endpoint now accepts optional parameters:

```bash
curl -X POST http://localhost:5000/predict \
  -F "image=@plate.jpg" \
  -F "crop_top_frac=0.25" \
  -F "min_confidence=55" \
  -F "debug=true"
```

**Parameters:**
- `crop_top_frac` (default: 0.25): Fraction to crop from top
- `min_confidence` (default: 55): Minimum confidence threshold (0-100)
- `debug` (default: false): Enable debug image output

## Testing Recommendations

1. Test with various lighting conditions
2. Test with different angles and distances
3. Monitor the debug output to tune `crop_top_frac` if needed
4. Adjust `min_confidence` based on your accuracy vs completeness needs:
   - Higher (60-70): Fewer false positives, might miss some characters
   - Lower (45-50): More complete reads, higher false positive rate

## Next Steps for Further Improvement

1. **Add plate format validation**: Check if output matches expected Nepali plate patterns
2. **Implement ensemble prediction**: Run recognition multiple times with slight variations
3. **Add character count validation**: Nepali plates have predictable character counts
4. **Train model with more augmented data**: Improve model robustness
5. **Add confidence-weighted spell correction**: Use plate dictionary to fix low-confidence predictions
