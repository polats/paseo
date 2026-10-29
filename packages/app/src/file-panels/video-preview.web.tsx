const videoStyle = {
  flex: 1,
  minHeight: 0,
  width: "100%",
  height: "100%",
  objectFit: "contain",
  backgroundColor: "black",
} as const;

export function FileVideoPreview({ uri, testID }: { uri: string; testID?: string }) {
  return <video data-testid={testID} src={uri} controls playsInline style={videoStyle} />;
}
