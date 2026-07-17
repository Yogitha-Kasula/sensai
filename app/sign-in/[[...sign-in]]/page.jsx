import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex justify-center items-center pt-24 pb-12">
      <SignIn 
        signUpUrl="/sign-up"
        appearance={{
          layout: {
            socialButtonsVariant: 'blockButton'
          },
          elements: {
            socialButtonsBlockButtonText: {
              color: 'white',
            },
            socialButtonsBlockButton: {
              color: 'white',
            }
          },
          variables: {
            colorBackground: '#1c1c1e',
            colorInputBackground: '#2c2c2e',
            colorInputText: '#ffffff',
            colorText: '#ffffff',
            colorTextSecondary: '#a1a1aa',
            colorPrimary: '#ffffff',
            colorTextOnPrimaryBackground: '#000000'
          }
        }}
      />
    </div>
  );
}
