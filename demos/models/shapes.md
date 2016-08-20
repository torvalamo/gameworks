# Shapes

## Triangle

"Upwards" pointing, horizontal baseline, before transformations.

### Origin

O: Origin, bottom left

### Variables

- Ew: Width (O -> x)
- Eh: Height ((x / 2) -> y)
- Ea: Angle (θO)

### Faces

- Front: Ew x Eh (O -> x -> y), clipped
- Back: Ew x Eh (O+x -> O -> y), clipped

### Method

Mark point on three of the four sides, and clip between them.

## Rectangle

Horizontal and vertical sides, before transformations.

### Origin

O: Origin, bottom left

### Variables

- Ew: Width (O -> x)
- Eh: Height (O -> y)

### Faces

- Front: Ew x Eh (O -> x -> y)
- Back: Ew x Eh (O+x -> O -> y)

## 